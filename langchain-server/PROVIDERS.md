# Supported LLM Providers

LangChain Server mendukung multiple LLM providers untuk fleksibilitas dalam memilih model yang sesuai dengan kebutuhan Anda.

## Public Cloud Providers

### OpenAI
```json
{
  "credential": {
    "provider": "openai",
    "api_key": "sk-..."
  },
  "input": "Your prompt here",
  "servers": ["http://localhost:4000", "http://localhost:4040"]
}
```

**Models:** `gpt-4o-mini`, `gpt-4o`, `gpt-4-turbo`, dll.

### Claude (Anthropic)
```json
{
  "credential": {
    "provider": "claude",
    "api_key": "sk-ant-..."
  },
  "input": "Your prompt here",
  "servers": ["http://localhost:4000", "http://localhost:4040"]
}
```

**Models:** `claude-3-5-sonnet-20241022`, `claude-3-opus`, dll.

### OpenRouter
```json
{
  "credential": {
    "provider": "openrouter",
    "api_key": "sk-or-..."
  },
  "input": "Your prompt here",
  "servers": ["http://localhost:4000", "http://localhost:4040"]
}
```

**Models:** Akses ke berbagai model melalui OpenRouter API.

## Local/Self-Hosted Providers

### Ollama
```json
{
  "credential": {
    "provider": "ollama",
    "url": "http://localhost:11434/v1"
  },
  "input": "Your prompt here",
  "servers": ["http://localhost:4000", "http://localhost:4040"]
}
```

**Setup:**
```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Pull model
ollama pull llama3.2

# Run Ollama server
ollama serve
```

### Llama.cpp
```json
{
  "credential": {
    "provider": "llama_cpp",
    "url": "http://localhost:8080/v1"
  },
  "input": "Your prompt here",
  "servers": ["http://localhost:4000", "http://localhost:4040"]
}
```

**Setup:**
```bash
# Clone llama.cpp
git clone https://github.com/ggerganov/llama.cpp
cd llama.cpp

# Build
make

# Run server with model
./server -m models/llama-3.2-3b-instruct.gguf --port 8080
```

### vLLM
```json
{
  "credential": {
    "provider": "vllm",
    "url": "http://localhost:8000/v1"
  },
  "input": "Your prompt here",
  "servers": ["http://localhost:4000", "http://localhost:4040"]
}
```

**Setup:**
```bash
# Install vLLM
pip install vllm

# Run vLLM server
python -m vllm.entrypoints.openai.api_server \
  --model meta-llama/Llama-3.2-3B-Instruct \
  --port 8000
```

## Example Request

```bash
curl -X POST http://localhost:6000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "credential": {
      "provider": "openai",
      "api_key": "sk-..."
    },
    "input": "Jumlahkan 5 dan 7, lalu generate angka random",
    "servers": [
      "http://localhost:4000",
      "http://localhost:4040"
    ]
  }'
```

## Notes

- **Public providers** memerlukan `api_key`
- **Local providers** memerlukan `url` endpoint
- Semua provider menggunakan OpenAI-compatible API format
- Model default dapat diubah di `llmFactory.ts`
