import { ChatOpenAI } from "@langchain/openai";
import { StateGraph, Annotation } from "@langchain/langgraph";
import { loadMcpTools } from "./mcpLoader";
import { OPENAI_API_KEY } from "./environment";

const AgentState = Annotation.Root({
  input: Annotation<string>(),

  messages: Annotation<any[]>({
    value: (x, y) => x.concat(y),
    default: () => [],
  }),
});

export async function createAgent() {
  const tools = await loadMcpTools();

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
      const call = last.tool_calls?.[0];

      if (!call) return {};

      const tool = toolMap.get(call.name);
      if (!tool) throw new Error(`Tool not found: ${call.name}`);

      // @ts-ignore
      const result = await tool.func(call.args);

      return {
        messages: [
          {
            role: "tool",
            tool_call_id: call.id,
            name: call.name,
            content: JSON.stringify(result),
          },
        ],
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
