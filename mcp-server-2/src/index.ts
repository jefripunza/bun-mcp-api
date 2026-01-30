import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { tools, findTool } from "./registry";

const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());

app.listen(4040, () => {
  console.log("🧠 MCP Server running on http://localhost:4040");
});
app.use(morgan("dev"));
app.get("/health", (_req, res) => res.json({ status: "ok" }));

// MCP-style: list tools
app.get("/mcp/tools", (_req, res) => {
  res.json(
    tools.map((t) => ({
      name: t.name,
      description: t.description,
      parameters: t.parameters,
    })),
  );
});

// MCP-style: invoke tool
app.post("/mcp/invoke", async (req, res) => {
  const { name, arguments: args } = req.body;
  const tool = findTool(name);

  if (!tool) {
    return res.status(404).json({ error: "Tool not found" });
  }
  if (!tool.handler) {
    return res.status(400).json({ error: "Tool handler not found" });
  }

  const result = await tool.handler(args);
  res.json(result);
});
