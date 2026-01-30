export interface Tool {
  name: string;
  description: string;
  parameters: ToolParameter;
  handler?: (args: any) => Promise<any>;
}

export type ParameterType = "string" | "number" | "boolean" | "object";

export interface ToolParameter {
  type: ParameterType;
  properties: Record<string, ToolParameterProperty>;
  required: string[];
}

export interface ToolParameterProperty {
  type: ParameterType;
  description?: string;
  enum?: string[];
}
