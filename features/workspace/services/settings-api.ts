export interface OpenRouterSettings {
  apiKey: string;
  model: string;
}

export interface OpenRouterSettingsView {
  apiKey: string;
  model: string;
  configured: boolean;
  lastValidated?: string;
}

export interface SaveSettingsResult {
  success: boolean;
  valid: boolean;
  message?: string;
  data?: OpenRouterSettingsView;
}

const API_BASE = "/api/settings/openrouter";

export async function getOpenRouterSettings(): Promise<
  OpenRouterSettingsView | null
> {
  const response = await fetch(API_BASE, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    return null;
  }

  const json = await response.json();
  return json.data ?? null;
}

export async function saveOpenRouterSettings(
  settings: OpenRouterSettings,
): Promise<SaveSettingsResult> {
  const response = await fetch(API_BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ apiKey: settings.apiKey, model: settings.model }),
  });

  const json = await response.json();

  return {
    success: response.ok,
    valid: json.valid ?? false,
    message: json.message,
    data: json.data,
  };
}

export async function validateOpenRouterApiKey(apiKey: string): Promise<{
  valid: boolean;
  message?: string;
}> {
  const response = await fetch(API_BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ apiKey, validateOnly: true }),
  });

  const json = await response.json();

  return {
    valid: json.valid ?? false,
    message: json.message,
  };
}
