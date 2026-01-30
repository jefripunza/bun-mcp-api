import axios from "axios";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { type Tool } from "../../types/tool";

export async function loadMcpTools(mcpServers: string[]) {
  const allTools: any[] = [];

  for (const mcpUrl of mcpServers) {
    try {
      const { data } = await axios.get<Tool[]>(`${mcpUrl}/mcp/tools`);

      const tools = data.map((tool: any) => {
        const schema = z.object(
          Object.fromEntries(
            Object.entries(tool.parameters.properties).map(
              ([key, val]: any) => [key, z.any()],
            ),
          ),
        );

        return new DynamicStructuredTool({
          name: tool.name,
          description: tool.description,
          schema,
          func: async (input) => {
            const res = await axios.post(`${mcpUrl}/mcp/invoke`, {
              name: tool.name,
              arguments: input,
            });
            return JSON.stringify(res.data);
          },
        });
      });

      allTools.push(...tools);
    } catch (error) {
      console.error(`Failed to load tools from ${mcpUrl}:`, error);
    }
  }

  return allTools;
}
