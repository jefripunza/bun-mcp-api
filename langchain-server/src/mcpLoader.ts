import axios from "axios";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { type Tool } from "../../types/tool";

const MCP_URL = "http://localhost:4000";

export async function loadMcpTools(mcpServers: string[]) {
  const { data } = await axios.get<Tool[]>(`${MCP_URL}/mcp/tools`);

  return data.map((tool: any) => {
    const schema = z.object(
      Object.fromEntries(
        Object.entries(tool.parameters.properties).map(([key, val]: any) => [
          key,
          z.any(),
        ]),
      ),
    );

    return new DynamicStructuredTool({
      name: tool.name,
      description: tool.description,
      schema,
      func: async (input) => {
        const res = await axios.post(`${MCP_URL}/mcp/invoke`, {
          name: tool.name,
          arguments: input,
        });
        return JSON.stringify(res.data);
      },
    });
  });
}
