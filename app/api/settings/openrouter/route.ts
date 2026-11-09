import { NextResponse } from "next/server";
import {
  readSettings,
  toSettingsView,
  writeSettings,
} from "@/lib/settings/store";

const OPENROUTER_MODELS_URL = "https://openrouter.ai/api/v1/models";

interface StoredOpenRouterSettings {
  apiKey: string;
  model: string;
  savedAt: string;
  lastValidated?: string;
  valid?: boolean;
}

interface SaveSettingsBody {
  apiKey?: string;
  model?: string;
  validateOnly?: boolean;
}

async function validateApiKey(apiKey: string): Promise<{
  valid: boolean;
  message?: string;
}> {
  try {
    const response = await fetch(OPENROUTER_MODELS_URL, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (response.ok) {
      return { valid: true };
    }

    if (response.status === 401 || response.status === 403) {
      return {
        valid: false,
        message: "Invalid OpenRouter API key. Please check your key.",
      };
    }

    return {
      valid: false,
      message: `OpenRouter responded with status ${response.status}.`,
    };
  } catch {
    return {
      valid: false,
      message: "Unable to reach OpenRouter to validate the API key.",
    };
  }
}

export async function GET() {
  try {
    const settings = await readSettings();

    if (!settings) {
      return NextResponse.json({
        success: true,
        data: {
          apiKey: "",
          model: "",
          configured: false,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: toSettingsView(settings),
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Unable to read settings." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SaveSettingsBody;
    const { apiKey, model, validateOnly } = body;

    if (!apiKey || !apiKey.trim()) {
      return NextResponse.json(
        { success: false, message: "API key is required." },
        { status: 400 },
      );
    }

    const trimmedApiKey = apiKey.trim();
    const trimmedModel = (model ?? "").trim();

    const validation = await validateApiKey(trimmedApiKey);

    if (validateOnly) {
      return NextResponse.json({
        success: true,
        valid: validation.valid,
        message: validation.message,
      });
    }

    const settings: StoredOpenRouterSettings = {
      apiKey: trimmedApiKey,
      model: trimmedModel,
      savedAt: new Date().toISOString(),
      lastValidated: new Date().toISOString(),
      valid: validation.valid,
    };

    await writeSettings(settings);

    return NextResponse.json({
      success: true,
      valid: validation.valid,
      message: validation.valid
        ? "Settings saved and API key validated."
        : "Settings saved, but the API key could not be validated.",
      data: toSettingsView(settings),
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Unable to save settings." },
      { status: 500 },
    );
  }
}
