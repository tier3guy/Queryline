import { ChatOpenRouter } from "@langchain/openrouter";

export interface OpenRouterConfig {
  apiKey?: string;
  model?: string;
}

export function createChatModel(config?: OpenRouterConfig) {
  const apiKey = config?.apiKey?.trim() || process.env.OPENROUTER_API_KEY;
  const model = config?.model?.trim() || process.env.OPENROUTER_MODEL;

  if (!apiKey || !model) {
    throw new Error(
      "OpenRouter is not configured. Add your API key and model in Settings or configure the server environment variables.",
    );
  }

  return new ChatOpenRouter({
    apiKey,
    model,
    temperature: 0,
    maxTokens: 2048,
  });
};
