import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import type { Message } from "@langchain/core/messages";

import { checkServers, createAgent } from "./agent";
import type { CompiledAgent } from "../../types/agent";
import type { RequestChatBody } from "../../types/request";
import { ErrorRequest } from "../../types/error";

const app = express();
app.use(cors());
app.use(express.json());
app.use(helmet());

app.listen(6000, () => {
  console.log("🤖 LangChain Server running on http://localhost:6000");
});
app.use(morgan("dev"));

app.post("/chat", async (req, res) => {
  try {
    const { credential, system_prompt, input, servers } =
      req.body as RequestChatBody;
    if (!credential) {
      throw new ErrorRequest("Missing credential", 401);
    }
    if (typeof credential.provider !== "string") {
      throw new ErrorRequest("Invalid provider");
    }
    if (!credential.provider) {
      throw new ErrorRequest("Missing provider");
    }
    if (
      ["openai", "claude", "openrouter"].includes(credential.provider) &&
      !credential.api_key
    ) {
      throw new ErrorRequest("Missing api key", 401);
    }
    if (
      ["ollama", "llama_cpp", "vllm"].includes(credential.provider) &&
      !credential.url
    ) {
      throw new ErrorRequest("Missing url", 401);
    }

    if (!input) {
      throw new ErrorRequest("Missing body request");
    }
    if (!servers || servers.length === 0) {
      throw new ErrorRequest("No MCP servers provided");
    }

    const availableServers = await checkServers(servers);
    const agent = (await createAgent(
      credential,
      availableServers,
      system_prompt,
    )) as CompiledAgent;
    const result = await agent.invoke({ input });
    const messages = result.messages;
    const last_message = messages.at(-1);
    result.message = (last_message as unknown as Message)?.content as string;
    return res.json(result);
  } catch (err) {
    if (err instanceof ErrorRequest) {
      return res.status(err.code).json({ error: err.message });
    }
    const message = err instanceof Error ? err.message : "Unknown error";
    return res.status(500).json({ error: message });
  }
});
