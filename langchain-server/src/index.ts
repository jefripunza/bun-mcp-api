import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { checkServers, createAgent } from "./agent";
import type { CompiledAgent } from "../../types/agent";
import type { Message } from "@langchain/core/messages";

const app = express();
app.use(cors());
app.use(express.json());
app.use(helmet());

app.listen(6000, () => {
  console.log("🤖 LangChain Server running on http://localhost:6000");
});
app.use(morgan("dev"));

app.post("/chat", async (req, res) => {
  const { input, servers } = req.body as {
    input: string;
    servers: string[];
  };
  if (!input) {
    return res.status(400).json({ error: "Missing body request" });
  }
  if (!servers || servers.length === 0) {
    return res.status(400).json({ error: "No MCP servers provided" });
  }

  const availableServers = await checkServers(servers);
  const agent = (await createAgent(availableServers)) as CompiledAgent;
  const result = await agent.invoke({ input });
  const messages = result.messages;
  const last_message = messages.at(-1);
  result.message = (last_message as unknown as Message)?.content as string;
  return res.json(result);
});
