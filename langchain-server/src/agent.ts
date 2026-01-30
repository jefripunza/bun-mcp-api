import { StateGraph, Annotation } from "@langchain/langgraph";
import { loadMcpTools } from "./mcpLoader";
import axios from "axios";
import type { RequestChatCredential } from "../../types/request";
import { createLLM } from "./llmFactory";
import { ErrorRequest } from "../../types/error";

export async function createAgent(
  credential: RequestChatCredential,
  mcpServers: string[],
  systemPrompt?: string,
) {
  const AgentState = Annotation.Root({
    input: Annotation<string>(),

    messages: Annotation<any[]>({
      value: (x, y) => x.concat(y),
      default: () => [],
    }),
  });

  const tools = await loadMcpTools(mcpServers);

  // map biar gampang lookup
  const toolMap = new Map(tools.map((t) => [t.name, t]));

  // Providers yang support native function calling
  const TOOL_CALLING_PROVIDERS = ["openai", "claude", "openrouter"];
  const supportsToolCalling = TOOL_CALLING_PROVIDERS.includes(
    credential.provider,
  );

  // Inisialisasi LLM berdasarkan provider yang dipilih
  const baseLLM = createLLM(credential);
  const llm = supportsToolCalling ? baseLLM.bindTools(tools) : baseLLM;

  console.log(
    `🤖 Using LLM provider: ${credential.provider} ${supportsToolCalling ? "(with native tool calling)" : "(with manual tool calling)"}`,
  );

  const graph = new StateGraph(AgentState)

    // 1️⃣ LLM
    .addNode("agent", async (state) => {
      const messages: any[] = [];

      // Add system prompt if provided and no messages yet
      if (systemPrompt && state.messages.length === 0) {
        messages.push({ role: "system", content: systemPrompt });
      }

      // For non-tool-calling providers, inject tool descriptions
      if (!supportsToolCalling && state.messages.length === 0) {
        const toolDescriptions = tools
          .map(
            (t: any) => {
              const params = Object.entries(t.schema?.shape || {})
                .map(([key, val]: any) => `${key}: ${val._def?.typeName || 'any'}`)
                .join(", ");
              return `- ${t.name}(${params}): ${t.description}`;
            },
          )
          .join("\n");

        const reactPrompt = `You have access to the following tools:

${toolDescriptions}

To use a tool, you MUST respond with ONLY a JSON object in this EXACT format:
{"tool_name": "name_of_tool", "tool_args": {"param1": "value1", "param2": value2}}

Do NOT add any explanation before or after the JSON. Just output the JSON.

If you don't need a tool, respond normally to the user's question.`;

        messages.push({ role: "system", content: reactPrompt });
      }

      messages.push(...state.messages);
      messages.push({ role: "user", content: state.input });

      const response = await llm.invoke(messages);

      // For non-tool-calling providers, parse manual tool calls from response
      if (!supportsToolCalling && response.content) {
        const content = response.content.toString().trim();
        
        // Pattern 1: Standard format {"tool_name": "...", "tool_args": {...}}
        let jsonMatch = content.match(/\{\s*"tool_name"\s*:\s*"([^"]+)"\s*,\s*"tool_args"\s*:\s*(\{[^}]*\})\s*\}/);
        
        // Pattern 2: Model custom format: to=tool.name json\n{...}
        if (!jsonMatch) {
          const customMatch = content.match(/to=(?:tool\.)?(\w+)\s+json\s*\n?\s*(\{[^}]+\})/);
          if (customMatch && customMatch[1] && customMatch[2]) {
            jsonMatch = ["", customMatch[1], customMatch[2]] as RegExpMatchArray;
          }
        }
        
        if (jsonMatch && jsonMatch[1] && jsonMatch[2]) {
          const toolName = jsonMatch[1];
          let argsStr = jsonMatch[2];
          
          try {
            const args = JSON.parse(argsStr);
            // Convert string numbers to actual numbers if needed
            Object.keys(args).forEach(key => {
              if (typeof args[key] === 'string' && !isNaN(Number(args[key]))) {
                args[key] = Number(args[key]);
              }
            });
            
            // Inject tool_calls manually for agent to process
            response.tool_calls = [
              {
                name: toolName,
                args: args,
                id: `manual_${Date.now()}`,
                type: "tool_call",
              },
            ];
            console.log(`🔧 Manual tool call detected: ${toolName}`, args);
          } catch (e) {
            console.error("Failed to parse manual tool call:", e);
          }
        }
      }

      return { messages: [response] };
    })

    // 2️⃣ Execute MCP tool MANUAL
    .addNode("tools", async (state) => {
      const last = state.messages.at(-1);
      const toolCalls = last.tool_calls || [];

      if (toolCalls.length === 0) return {};

      const toolMessages = await Promise.all(
        toolCalls.map(async (call: any) => {
          const tool = toolMap.get(call.name);
          if (!tool) throw new ErrorRequest(`Tool not found: ${call.name}`, 404);

          // @ts-ignore
          const result = await tool.func(call.args);

          return {
            role: "tool",
            tool_call_id: call.id,
            name: call.name,
            content: JSON.stringify(result),
          };
        }),
      );

      return {
        messages: toolMessages,
      };
    })

    // 3️⃣ Routing
    .addConditionalEdges("agent", (state) => {
      const last = state.messages.at(-1);
      return last?.tool_calls?.length ? "tools" : "__end__";
    })

    // 4️⃣ Edge
    .addEdge("tools", "agent")
    .addEdge("__start__", "agent");

  return graph.compile();
}

export const checkServers = async (mcpServers: string[]): Promise<string[]> => {
  const availableServers: string[] = [];

  for (const serverUrl of mcpServers) {
    try {
      const response = await axios.get(`${serverUrl}/health`, {
        timeout: 5000,
      });

      if (response.status === 200) {
        availableServers.push(serverUrl);
        console.log(`✅ MCP Server ${serverUrl} is healthy`);
      } else {
        console.warn(
          `⚠️  MCP Server ${serverUrl} returned status ${response.status}`,
        );
      }
    } catch (error) {
      console.error(
        `❌ MCP Server ${serverUrl} is not available:`,
        error instanceof Error ? error.message : error,
      );
    }
  }

  return availableServers;
};
