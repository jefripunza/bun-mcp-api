export interface RequestChatBody {
  credential: RequestChatCredential;
  input: string;
  servers: string[];
}

export interface RequestChatCredential {
  provider: LlmPublicProvider | LlmLocalProvider;
  url?: string;
  api_key?: string;
}

export type LlmPublicProvider = "openai" | "claude" | "openrouter";
export type LlmLocalProvider = "ollama" | "llama_cpp" | "vllm";
