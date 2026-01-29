import { mathTools } from "./tools/math";
import { weatherTools } from "./tools/weather";

export const tools = [...mathTools, ...weatherTools];

export function findTool(name: string) {
  return tools.find((t) => t.name === name);
}
