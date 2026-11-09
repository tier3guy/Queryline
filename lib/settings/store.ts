import fs from "fs/promises";
import path from "path";

const SETTINGS_DIR = path.join(process.cwd(), ".queryline");
const SETTINGS_FILE = path.join(SETTINGS_DIR, "settings.json");

export interface StoredOpenRouterSettings {
  apiKey: string;
  model: string;
  savedAt: string;
  lastValidated?: string;
  valid?: boolean;
}

export interface OpenRouterSettingsView {
  apiKey: string;
  model: string;
  configured: boolean;
  lastValidated?: string;
}

async function ensureDir(): Promise<void> {
  try {
    await fs.mkdir(SETTINGS_DIR, { recursive: true });
  } catch {
    // The directory may already exist, or the filesystem may be read-only
    // (e.g. some serverless deployments). Settings fall back to localStorage.
  }
}

export async function readSettings(): Promise<StoredOpenRouterSettings | null> {
  try {
    await ensureDir();
    const content = await fs.readFile(SETTINGS_FILE, "utf8");
    return JSON.parse(content) as StoredOpenRouterSettings;
  } catch {
    return null;
  }
}

export async function writeSettings(
  settings: StoredOpenRouterSettings,
): Promise<void> {
  await ensureDir();
  await fs.writeFile(
    SETTINGS_FILE,
    JSON.stringify(settings, null, 2),
    "utf8",
  );
}

export function maskApiKey(apiKey: string): string {
  if (!apiKey) return "";
  return apiKey.length > 4 ? `****${apiKey.slice(-4)}` : "****";
}

export function toSettingsView(
  settings: StoredOpenRouterSettings,
): OpenRouterSettingsView {
  return {
    apiKey: maskApiKey(settings.apiKey),
    model: settings.model,
    configured: Boolean(settings.apiKey && settings.model),
    lastValidated: settings.lastValidated,
  };
}
