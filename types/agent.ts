export interface ToolCall {
  id: string;
  name: string;
  args: Record<string, any>;
  type: string;
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface UsageMetadata {
  output_tokens: number;
  input_tokens: number;
  total_tokens: number;
  input_token_details?: {
    audio: number;
    cache_read: number;
  };
  output_token_details?: {
    audio: number;
    reasoning: number;
  };
}

export interface ResponseMetadata {
  tokenUsage: TokenUsage;
  finish_reason: string;
  model_provider: string;
  model_name: string;
  usage: any;
  system_fingerprint: string;
}

export interface AIMessage {
  lc: number;
  type: string;
  id: string[];
  kwargs: {
    id: string;
    content: string;
    additional_kwargs: {
      tool_calls?: any[];
    };
    response_metadata: ResponseMetadata;
    type: string;
    tool_calls: ToolCall[];
    invalid_tool_calls: any[];
    usage_metadata: UsageMetadata;
  };
}

export interface ToolMessage {
  role: string;
  tool_call_id: string;
  name: string;
  content: string;
}

export type Message = AIMessage | ToolMessage;

export interface AgentState {
  input: string;
  messages: Message[];
  message?: string;
}

export interface CompiledAgent {
  invoke(input: { input: string }): Promise<AgentState>;
  stream?(input: { input: string }): Promise<any>;
}
