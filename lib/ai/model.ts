import { ChatOpenRouter } from "@langchain/openrouter";

export function createChatModel() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL;

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured.");
  }

  if (!model) {
    throw new Error("OPENROUTER_MODEL is not configured.");
  }

  return new ChatOpenRouter({
    apiKey,
    model,
    temperature: 0,
    maxTokens: 2048,
  });
}