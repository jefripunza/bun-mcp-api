import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { createAgent } from "./agent";
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
  const { input, mcpServers } = req.body as {
    input: string;
    mcpServers: string[];
  };
  const agent = (await createAgent(mcpServers)) as CompiledAgent;
  const result = await agent.invoke({ input });
  const messages = result.messages;
  const last_message = messages.at(-1);
  result.message = (last_message as unknown as Message)?.content as string;
  res.json(result);
});
