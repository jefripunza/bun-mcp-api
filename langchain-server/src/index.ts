import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { createAgent } from "./agent";
import type { CompiledAgent } from "../../types/agent";

const app = express();
app.use(cors());
app.use(express.json());
app.use(helmet());

let agent: CompiledAgent;

app.listen(6000, () => {
  console.log("🤖 LangChain Server running on http://localhost:6000");
});
app.use(morgan("dev"));

app.post("/chat", async (req, res) => {
  if (!agent) {
    agent = await createAgent();
  }

  const { input } = req.body;
  const result = await agent.invoke({ input });

  res.json(result);
});
