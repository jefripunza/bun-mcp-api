import type { Tool } from "../../../types/tool";

export const weatherTools: Tool[] = [
  {
    name: "getWeather",
    description: "Ambil cuaca berdasarkan kota",
    parameters: {
      type: "object",
      properties: {
        city: { type: "string" },
      },
      required: ["city"],
    },
    handler: async ({ city }: { city: string }) => {
      return {
        city,
        temperature: "30C",
        condition: "Sunny",
      };
    },
  },
];
