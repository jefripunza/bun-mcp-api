import { ChatOpenAI } from "@langchain/openai";
import type { RequestChatCredential } from "../../types/request";
import { ErrorRequest } from "../../types/error";

const DEFAULT_MODELS = {
  openai: "gpt-4o-mini",
  claude: "claude-3-5-sonnet-20241022",
  openrouter: "anthropic/claude-3.5-sonnet",
  ollama: "llama3.2",
  llama_cpp: "gpt-oss-20b.gguf",
  vllm: "meta-llama/Llama-3.2-3B-Instruct",
};

export function createLLM(credential: RequestChatCredential): ChatOpenAI {
  const { provider, api_key, url, model, set } = credential;

  // Get model: use custom model or default for provider
  const selectedModel = model || DEFAULT_MODELS[provider];

  // Build base config with optional settings
  const baseConfig: any = {
    model: selectedModel,
    temperature: set?.temperature ?? 0,
    apiKey: api_key || "default",
  };

  // Add optional settings if provided
  if (set?.max_tokens) baseConfig.maxTokens = set.max_tokens;
  if (set?.top_p !== undefined) baseConfig.topP = set.top_p;
  if (set?.frequency_penalty !== undefined)
    baseConfig.frequencyPenalty = set.frequency_penalty;
  if (set?.presence_penalty !== undefined)
    baseConfig.presencePenalty = set.presence_penalty;
  if (set?.stop) baseConfig.stop = set.stop;
  if (set?.seed !== undefined) baseConfig.seed = set.seed;
  if (set?.timeout) baseConfig.timeout = set.timeout;
  if (set?.max_retries !== undefined) baseConfig.maxRetries = set.max_retries;

  switch (provider) {
    case "openai":
      if (!api_key) throw new ErrorRequest("OpenAI API key is required", 401);
      return new ChatOpenAI(baseConfig);

    case "claude":
      if (!api_key) throw new ErrorRequest("Claude API key is required", 401);
      return new ChatOpenAI({
        ...baseConfig,
        configuration: {
          baseURL: "https://api.anthropic.com/v1",
        },
      });

    case "openrouter":
      if (!api_key)
        throw new ErrorRequest("OpenRouter API key is required", 401);
      return new ChatOpenAI({
        ...baseConfig,
        configuration: {
          baseURL: "https://openrouter.ai/api/v1",
        },
      });

    case "ollama":
      if (!url) throw new ErrorRequest("Ollama URL is required");
      return new ChatOpenAI({
        ...baseConfig,
        apiKey: "ollama",
        configuration: {
          baseURL: url,
        },
      });

    case "llama_cpp":
      if (!url) throw new ErrorRequest("Llama.cpp URL is required");
      return new ChatOpenAI({
        ...baseConfig,
        apiKey: "llama_cpp",
        configuration: {
          baseURL: url,
        },
      });

    case "vllm":
      if (!url) throw new ErrorRequest("vLLM URL is required");
      return new ChatOpenAI({
        ...baseConfig,
        apiKey: "vllm",
        configuration: {
          baseURL: url,
        },
      });

    default:
      throw new ErrorRequest(`Unsupported provider: ${provider}`, 404);
  }
}
