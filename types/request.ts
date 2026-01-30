export interface RequestChatBody {
  credential: RequestChatCredential;
  system_prompt?: string;
  input: string;
  servers: string[];
}

export interface RequestChatCredential {
  provider: LlmPublicProvider | LlmLocalProvider;
  model?: string; // jika tidak di isi maka masing2 punya default
  url?: string;
  api_key?: string;
  set?: SetLlm;
}

export interface SetLlm {
  temperature?: number; // 0.0 - 2.0, default: 0
  max_tokens?: number; // Maximum tokens to generate
  top_p?: number; // 0.0 - 1.0, nucleus sampling
  frequency_penalty?: number; // -2.0 - 2.0, penalize frequent tokens
  presence_penalty?: number; // -2.0 - 2.0, penalize repeated tokens
  stop?: string[]; // Stop sequences
  timeout?: number; // Request timeout in ms
  max_retries?: number; // Number of retries on failure
}

export type LlmPublicProvider = "openai" | "claude" | "openrouter";
export type LlmLocalProvider = "ollama" | "llama_cpp" | "vllm";
