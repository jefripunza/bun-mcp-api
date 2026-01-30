import { ChatOllama } from "@langchain/ollama";
import { CallbackManagerForLLMRun } from "@langchain/core/callbacks/manager";
import { AIMessageChunk, BaseMessage } from "@langchain/core/messages";
import { ChatGenerationChunk } from "@langchain/core/outputs";

/**
 * Custom ChatOllama wrapper for llama.cpp server
 * Handles different response format from llama.cpp
 */
export class ChatOllamaLlamaCpp extends ChatOllama {
  private debug: boolean;
  constructor(config: any) {
    super(config);
    this.debug = config.debug || false;
  }

  /**
   * Override invoke to handle llama.cpp response format for non-streaming
   */
  override async invoke(
    input: BaseMessage[] | string,
    options?: any,
  ): Promise<any> {
    const messages =
      typeof input === "string"
        ? [{ role: "user", content: input }]
        : this.convertToOpenAIMessages(input as BaseMessage[]);

    const apiUrl = `${this.baseUrl}/v1/chat/completions`;

    const requestBody: any = {
      model: this.model,
      messages: messages,
      temperature: 0.7,
      stream: false,
    };

    // Tools are now included in system prompt instead of request parameter
    // This is more reliable for llama.cpp
    if (this.debug)
      console.log(
        "Tools are included in system prompt, not as request parameter",
      );

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: any = await response.json();
      const responseMessage = data.choices?.[0]?.message;
      if (this.debug)
        console.log("Response from llama.cpp (invoke):", responseMessage);

      const content = responseMessage?.content ?? "";
      const toolCalls = this.parseToolCalls(content);

      if (toolCalls.length > 0) {
        if (this.debug)
          console.log("Tool calls detected in invoke:", toolCalls);

        return new AIMessageChunk({
          content: "",
          tool_calls: toolCalls.map((tc: any) => ({
            name: tc.name,
            args: tc.args,
            id: tc.id,
          })),
          additional_kwargs: {
            tool_calls: toolCalls.map((tc: any, index: number) => ({
              id: tc.id ?? `call_${index}`,
              type: "function",
              function: {
                name: tc.name,
                arguments: JSON.stringify(tc.args),
              },
            })),
          },
        });
      } else {
        const cleanedContent = this.cleanLlamaCppResponse(content);
        return new AIMessageChunk({
          content: cleanedContent,
        });
      }
    } catch (error) {
      console.error("Error calling llama.cpp API (invoke):", error);
      throw error;
    }
  }

  /**
   * Override _streamResponseChunks to handle llama.cpp response format
   */
  override async *_streamResponseChunks(
    messages: BaseMessage[],
    options: this["ParsedCallOptions"],
    runManager?: CallbackManagerForLLMRun,
  ): AsyncGenerator<ChatGenerationChunk> {
    const params = this.invocationParams(options);
    const openAIMessages = this.convertToOpenAIMessages(messages);

    // Use OpenAI-compatible API endpoint for llama.cpp
    const apiUrl = `${this.baseUrl}/v1/chat/completions`;

    const requestBody: any = {
      model: params.model,
      messages: openAIMessages,
      temperature: (params as any).temperature ?? 0.7,
      stream: false, // Non-streaming for better compatibility
    };

    // Tools are now included in system prompt instead of request parameter
    // This is more reliable for llama.cpp

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
        signal: options.signal,
      });

      const data: any = await response.json();
      if (!response.ok) {
        if (this.debug) console.log(data);
        throw new Error(
          `HTTP error! status: ${response.status}\nmessage: ${data.error.message}`,
        );
      }

      const responseMessage = data.choices?.[0]?.message;
      if (this.debug)
        console.log(
          "Response from llama.cpp (_streamResponseChunks):",
          responseMessage,
        );

      // Extract content from OpenAI-compatible response format
      const content = responseMessage?.content ?? "";
      if (this.debug) console.log("Content to parse:", content);

      // Parse tool calls from llama.cpp format
      const toolCalls = this.parseToolCalls(content);
      if (this.debug) console.log("Parsed tool calls:", toolCalls);

      if (toolCalls.length > 0) {
        // If tool calls detected, return them for agent to execute
        if (this.debug)
          console.log(
            "Tool calls detected in _streamResponseChunks:",
            toolCalls,
          );

        // Format tool calls properly for LangChain
        const formattedToolCalls = toolCalls.map((tc: any) => ({
          name: tc.name,
          args: tc.args,
          id: tc.id,
        }));

        yield new ChatGenerationChunk({
          text: "",
          message: new AIMessageChunk({
            content: "",
            tool_calls: formattedToolCalls,
            additional_kwargs: {
              tool_calls: toolCalls.map((tc: any, index: number) => ({
                id: tc.id ?? `call_${index}`,
                type: "function",
                function: {
                  name: tc.name,
                  arguments: JSON.stringify(tc.args),
                },
              })),
            },
          }),
        });

        if (this.debug)
          console.log("Tool calls yielded, agent should execute them now");
      } else {
        // No tool calls, return cleaned content
        const cleanedContent = this.cleanLlamaCppResponse(content);

        yield new ChatGenerationChunk({
          text: cleanedContent,
          message: new AIMessageChunk({
            content: cleanedContent,
          }),
        });

        await runManager?.handleLLMNewToken(cleanedContent);
      }
    } catch (error) {
      console.error("Error calling llama.cpp API:", error);
      throw error;
    }
  }

  /**
   * Convert LangChain messages to OpenAI-compatible format
   */
  convertToOpenAIMessages(messages: BaseMessage[]) {
    return messages.map((msg) => {
      const role =
        msg._getType() === "human" || msg._getType() === "generic"
          ? "user"
          : msg._getType() === "ai"
            ? "assistant"
            : msg._getType();

      return {
        role,
        content:
          typeof msg.content === "string"
            ? msg.content
            : JSON.stringify(msg.content),
      };
    });
  }

  /**
   * Parse tool calls from llama.cpp response format
   * Formats:
   * - "to=search_products_by_category tool_input {\"category\":\"laptop\"}"
   * - "to=search_products_by_name tool_input code<|message|>{\"name\":\"laptop\"}"
   * - "to=search_products_by_category<<json\n{\"category\":\"electronics\"}"
   * - "assistant<|channel|>analysis to=search_products_by_status code<|message|>{\"status\":\"active\"}"
   * - "to=search_products_by_name>{\"name\":\"tablet\"}"
   * - "to= list_product_categories code<|message|>{\"name\":\"list_product_categories\"}"
   */
  private parseToolCalls(
    content: string,
  ): Array<{ id?: string; name: string; args: any }> {
    const toolCalls: Array<{ id?: string; name: string; args: any }> = [];

    // Pattern 1: [optional tokens] to=<tool_name> [space/tokens] <json>
    // Matches:
    // - to=tool tool_input {...}
    // - to=tool tool_input code<|message|>{...}
    // - assistant<|channel|>analysis to=tool tool_input code<|message|>{...}
    // - to=tool>{...}
    const pattern1Regex = /to=(\w+)\s*(?:tool_input\s+)?(?:[^{]*)?({)/g;
    let match;

    while ((match = pattern1Regex.exec(content)) !== null) {
      const toolName = match[1];
      const jsonStart = match.index + match[0].length - 1; // Position of '{'

      // Extract JSON manually to handle nested braces
      let braceCount = 0;
      let jsonEnd = jsonStart;
      for (let i = jsonStart; i < content.length; i++) {
        if (content[i] === "{") braceCount++;
        if (content[i] === "}") braceCount--;
        if (braceCount === 0) {
          jsonEnd = i + 1;
          break;
        }
      }

      const argsStr = content.substring(jsonStart, jsonEnd);

      if (toolName && argsStr) {
        try {
          const args = JSON.parse(argsStr);
          toolCalls.push({
            name: toolName,
            args: args,
            id: `call_${Date.now()}_${toolName}`,
          });
          if (this.debug)
            console.log(`✅ Parsed tool call: ${toolName} with args:`, args);
        } catch (e) {
          console.error("Failed to parse tool arguments:", argsStr, e);
        }
      }
    }

    // Pattern 2: to=<tool_name><<json\n{...}
    // Matches: to=tool<<json\n{...}
    const pattern2Regex = /to=(\w+)<<json\s*\n?\s*({)/g;

    while ((match = pattern2Regex.exec(content)) !== null) {
      const toolName = match[1];
      const jsonStart = match.index + match[0].length - 1; // Position of '{'

      // Extract JSON manually to handle nested braces
      let braceCount = 0;
      let jsonEnd = jsonStart;
      for (let i = jsonStart; i < content.length; i++) {
        if (content[i] === "{") braceCount++;
        if (content[i] === "}") braceCount--;
        if (braceCount === 0) {
          jsonEnd = i + 1;
          break;
        }
      }

      const argsStr = content.substring(jsonStart, jsonEnd);

      if (toolName && argsStr) {
        try {
          const args = JSON.parse(argsStr);
          toolCalls.push({
            name: toolName,
            args: args,
            id: `call_${Date.now()}_${toolName}`,
          });
          if (this.debug)
            console.log(
              `✅ Parsed tool call (<<json format): ${toolName} with args:`,
              args,
            );
        } catch (e) {
          console.error("Failed to parse tool arguments:", argsStr, e);
        }
      }
    }

    // Pattern 3: to= <tool_name> (with space after =)
    // Matches: to= list_product_categories code<|message|>{...}
    const pattern3Regex = /to=\s+(\w+)\s*(?:[^{]*)?({)/g;

    while ((match = pattern3Regex.exec(content)) !== null) {
      const toolName = match[1];
      const jsonStart = match.index + match[0].length - 1; // Position of '{'

      // Extract JSON manually to handle nested braces
      let braceCount = 0;
      let jsonEnd = jsonStart;
      for (let i = jsonStart; i < content.length; i++) {
        if (content[i] === "{") braceCount++;
        if (content[i] === "}") braceCount--;
        if (braceCount === 0) {
          jsonEnd = i + 1;
          break;
        }
      }

      const argsStr = content.substring(jsonStart, jsonEnd);

      if (toolName && argsStr) {
        try {
          const args = JSON.parse(argsStr);

          // Avoid duplicates
          if (!toolCalls.find((tc) => tc.name === toolName)) {
            toolCalls.push({
              name: toolName,
              args: args,
              id: `call_${Date.now()}_${toolName}`,
            });
            if (this.debug)
              console.log(
                `✅ Parsed tool call (to= format): ${toolName} with args:`,
                args,
              );
          }
        } catch (e) {
          console.error("Failed to parse tool arguments:", argsStr, e);
        }
      }
    }

    // Pattern 4: JSON format in commentary: {"name":"ping","arguments":{"host":"1.1.1.1"}}
    const pattern4 =
      /{["']name["']\s*:\s*["'](\w+)["']\s*,\s*["']arguments["']\s*:\s*({[^}]*})}/g;

    while ((match = pattern4.exec(content)) !== null) {
      const toolName = match[1];
      const argsStr = match[2];

      if (toolName && argsStr) {
        try {
          const args = JSON.parse(argsStr);
          // Avoid duplicates
          if (!toolCalls.find((tc) => tc.name === toolName)) {
            toolCalls.push({
              name: toolName,
              args: args,
              id: `call_${Date.now()}_${toolName}`,
            });
          }
        } catch (e) {
          console.error("Failed to parse tool arguments:", argsStr, e);
        }
      }
    }

    return toolCalls;
  }

  /**
   * Clean llama.cpp response format - remove special tokens and metadata
   */
  private cleanLlamaCppResponse(text: string): string {
    let cleaned = text;

    // Remove thinking/reasoning blocks before <|end|>
    cleaned = cleaned.replace(/^[\s\S]*?<\|end\|>/g, "");

    // Remove <|start|>assistant<|channel|>final|...> metadata prefix
    cleaned = cleaned.replace(/<\|start\|>assistant<\|channel\|>[^>]*>/g, "");

    // Remove remaining special tokens
    cleaned = cleaned.replace(/<\|start\|>/g, "");
    cleaned = cleaned.replace(/<\|end\|>/g, "");
    cleaned = cleaned.replace(/<\|im_start\|>/g, "");
    cleaned = cleaned.replace(/<\|im_end\|>/g, "");
    cleaned = cleaned.replace(/<\|im_reply\|>/g, "");
    cleaned = cleaned.replace(/<\|channel\|>/g, "");
    cleaned = cleaned.replace(/<\|call\|>/g, "");
    cleaned = cleaned.replace(/<\|return\|>/g, "");

    return cleaned.trim();
  }
}
