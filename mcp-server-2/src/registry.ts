import { textTools } from "./tools/text";
import { datetimeTools } from "./tools/datetime";
import { converterTools } from "./tools/converter";
import { randomTools } from "./tools/random";

export const tools = [
  ...textTools,
  ...datetimeTools,
  ...converterTools,
  ...randomTools,
];

export function findTool(name: string) {
  return tools.find((t) => t.name === name);
}
