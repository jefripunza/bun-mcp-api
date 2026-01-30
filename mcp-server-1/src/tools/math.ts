import type { Tool } from "../../../types/tool";

export const mathTools: Tool[] = [
  {
    name: "add",
    description: "Menjumlahkan dua angka",
    parameters: {
      type: "object",
      properties: {
        a: { type: "number" },
        b: { type: "number" },
      },
      required: ["a", "b"],
    },
    handler: async ({ a, b }: { a: number; b: number }) => {
      console.log(`✅ MCP1 Math: ${a}+${b}=${a + b}`);
      return { result: a + b };
    },
  },
];
