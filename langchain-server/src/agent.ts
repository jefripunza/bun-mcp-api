import { ChatOpenAI } from "@langchain/openai";
import { StateGraph, Annotation } from "@langchain/langgraph";
import { loadMcpTools } from "./mcpLoader";
import { OPENAI_API_KEY } from "./environment";
import axios from "axios";
import type { RequestChatCredential } from "../../types/request";

export async function createAgent(
  credential: RequestChatCredential,
  mcpServers: string[],
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

  const llm = new ChatOpenAI({
    model: "gpt-4o-mini",
    temperature: 0,
    apiKey: OPENAI_API_KEY,
  }).bindTools(tools);

  const graph = new StateGraph(AgentState)

    // 1️⃣ LLM
    .addNode("agent", async (state) => {
      const response = await llm.invoke([
        ...state.messages,
        { role: "user", content: state.input },
      ]);

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
          if (!tool) throw new Error(`Tool not found: ${call.name}`);

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
