"use client";

import Icon from "@/components/icons";
import {
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  getOpenRouterSettings,
  saveOpenRouterSettings,
  validateOpenRouterApiKey,
  type OpenRouterSettings,
} from "@/features/workspace/services/settings-api";

type QueryPermission = "read-only" | "ask-before-write" | "read-write";

interface SettingsModalProps {
  onClose: () => void;
}

const PERMISSION_STORAGE_KEY = "queryline:query-permission";
const OPENROUTER_STORAGE_KEY = "queryline:openrouter-settings";

const permissionOptions: {
  value: QueryPermission;
  title: string;
  description: string;
}[] = [
  {
    value: "read-only",
    title: "Read-only",
    description: "Allow SELECT queries and block database modifications.",
  },
  {
    value: "ask-before-write",
    title: "Ask before writing",
    description: "Require approval before executing write operations.",
  },
  {
    value: "read-write",
    title: "Read and write",
    description: "Allow both read and write operations.",
  },
];

export default function SettingsModal({ onClose }: SettingsModalProps) {
  const [permission, setPermission] = useState<QueryPermission>("read-only");
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [saved, setSaved] = useState(false);

  const [serverStatus, setServerStatus] = useState<{
    apiKey: string;
    model: string;
    configured: boolean;
    lastValidated?: string;
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<
    "valid" | "invalid" | null
  >(null);
  const [validationMessage, setValidationMessage] = useState("");

  const fetchServerStatus = useCallback(async () => {
    try {
      const status = await getOpenRouterSettings();
      setServerStatus(status ?? null);
    } catch {
      setServerStatus(null);
    }
  }, []);

  useEffect(() => {
    const storedPermission = localStorage.getItem(PERMISSION_STORAGE_KEY);
    const storedOpenRouter = localStorage.getItem(OPENROUTER_STORAGE_KEY);

    if (
      storedPermission === "read-only" ||
      storedPermission === "ask-before-write" ||
      storedPermission === "read-write"
    ) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPermission(storedPermission);
    }

    if (storedOpenRouter) {
      try {
        const settings = JSON.parse(storedOpenRouter) as OpenRouterSettings;

        setApiKey(settings.apiKey ?? "");
        setModel(settings.model ?? "");
      } catch {
        localStorage.removeItem(OPENROUTER_STORAGE_KEY);
      }
    }

    fetchServerStatus();
  }, [fetchServerStatus]);

  const handleSave = async () => {
    const settings: OpenRouterSettings = {
      apiKey: apiKey.trim(),
      model: model.trim(),
    };

    localStorage.setItem(PERMISSION_STORAGE_KEY, permission);
    localStorage.setItem(OPENROUTER_STORAGE_KEY, JSON.stringify(settings));

    setIsSaving(true);
    try {
      const result = await saveOpenRouterSettings(settings);

      setSaved(true);
      setValidationResult(result.valid ? "valid" : "invalid");
      setValidationMessage(
        result.message ??
          (result.valid
            ? "Settings saved and API key validated."
            : "Settings saved, but the API key could not be validated."),
      );

      await fetchServerStatus();
    } catch {
      setSaved(true);
      setValidationMessage("Saved locally. Unable to sync with the server.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestApiKey = async () => {
    if (!apiKey.trim()) {
      setValidationResult("invalid");
      setValidationMessage("Please enter an API key to test.");
      return;
    }

    setIsValidating(true);
    setValidationResult(null);
    setValidationMessage("");

    try {
      const result = await validateOpenRouterApiKey(apiKey.trim());
      setValidationResult(result.valid ? "valid" : "invalid");
      setValidationMessage(
        result.message ??
          (result.valid
            ? "API key is valid."
            : "API key validation failed. Check your key and try again."),
      );
    } catch {
      setValidationResult("invalid");
      setValidationMessage("Unable to validate the API key.");
    } finally {
      setIsValidating(false);
    }
  };

  const handleClearApiKey = () => {
    setApiKey("");
    setSaved(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        className="flex max-h-[90vh] w-full max-w-xl flex-col border border-neutral-200 bg-white shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-5">
          <div>
            <h2
              id="settings-title"
              className="text-base font-semibold text-neutral-950"
            >
              Settings
            </h2>
            <p className="mt-1 text-xs text-neutral-500">
              Configure your AI provider and query permissions.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings"
            className="flex size-8 items-center justify-center text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-950"
          >
            <span className="text-xl leading-none">&times;</span>
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-5">
          {/* AI Provider */}
          <section>
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-neutral-900">
                AI Provider
              </h3>
              <p className="mt-1 text-xs leading-5 text-neutral-500">
                Connect your own OpenRouter account to power Queryline.
              </p>
            </div>

            {/* Server-side settings status */}
            {serverStatus && (
              <div className="mb-4 border border-neutral-200 bg-neutral-50/50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`size-2 shrink-0 rounded-full ${
                      serverStatus.configured ? "bg-emerald-500" : "bg-neutral-300"
                    }`}
                  />
                  <span className="text-xs font-semibold text-neutral-700 uppercase">
                    Server settings
                  </span>
                </div>
                <p className="text-xs text-neutral-600">
                  {serverStatus.configured
                    ? `OpenRouter is configured on the server${
                        serverStatus.lastValidated
                          ? ` · last validated ${new Date(serverStatus.lastValidated).toLocaleDateString()}`
                          : ""
                      }.`
                    : "No OpenRouter settings saved on the server."}
                </p>
                {serverStatus.model && (
                  <p className="mt-1 text-[10px] font-mono text-neutral-400">
                    Model: {serverStatus.model}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="openrouter-api-key"
                  className="mb-2 block text-xs font-medium text-neutral-700"
                >
                  OpenRouter API Key
                </label>

                <div className="flex h-10 items-center border border-neutral-200 focus-within:border-neutral-400">
                  <input
                    id="openrouter-api-key"
                    type={showApiKey ? "text" : "password"}
                    value={apiKey}
                    onChange={(event) => {
                      setApiKey(event.target.value);
                      setSaved(false);
                    }}
                    placeholder="sk-or-v1-..."
                    autoComplete="off"
                    spellCheck={false}
                    className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm text-neutral-900 outline-none placeholder:text-neutral-400"
                  />

                  <button
                    type="button"
                    onClick={() => setShowApiKey((current) => !current)}
                    aria-label={showApiKey ? "Hide API key" : "Show API key"}
                    disabled={isValidating}
                    className="flex size-10 shrink-0 items-center justify-center text-neutral-400 transition-colors hover:text-neutral-700 disabled:opacity-50"
                  >
                    <Icon
                      name={showApiKey ? "eye-off" : "eye"}
                      size={17}
                    />
                  </button>

                  {apiKey.trim() && (
                    <button
                      type="button"
                      onClick={handleTestApiKey}
                      disabled={isValidating}
                      aria-label={
                        isValidating ? "Validating API key..." : "Test API key"
                      }
                      className="ml-2 flex size-10 shrink-0 items-center justify-center text-neutral-400 transition-colors hover:text-[#f36b3f] disabled:opacity-50"
                    >
                      {isValidating ? (
                        <span className="text-[10px]">↻</span>
                      ) : (
                        <Icon name="alert-circle" size={15} />
                      )}
                    </button>
                  )}
                </div>

                {validationResult !== null && (
                  <p className="mt-2 text-[11px] leading-5">
                    <span
                      className={`font-medium ${
                        validationResult === "valid"
                          ? "text-emerald-700"
                          : "text-red-700"
                      }`}
                    >
                      {validationResult === "valid" ? "✓" : "✗"}
                    </span>{" "}
                    {validationMessage}
                  </p>
                )}

                <p className="mt-2 text-[11px] leading-5 text-neutral-500">
                  Your key is saved in this browser&apos;s local storage and
                  synced to the server when you save.
                </p>
              </div>

              <div>
                <label
                  htmlFor="openrouter-model"
                  className="mb-2 block text-xs font-medium text-neutral-700"
                >
                  Model ID
                </label>

                <input
                  id="openrouter-model"
                  type="text"
                  value={model}
                  onChange={(event) => {
                    setModel(event.target.value);
                    setSaved(false);
                  }}
                  placeholder="e.g. openai/gpt-4o-mini"
                  autoComplete="off"
                  spellCheck={false}
                  className="h-10 w-full border border-neutral-200 bg-white px-3 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-neutral-400"
                />

                <p className="mt-2 text-[11px] leading-5 text-neutral-500">
                  Enter the exact model identifier from OpenRouter.
                </p>
              </div>

              <div className="border border-neutral-200 bg-neutral-50 p-4">
                <p className="text-xs font-semibold text-neutral-800">
                  How to get your API key
                </p>

                <ol className="mt-3 space-y-2 text-xs leading-5 text-neutral-600">
                  <li>
                    <span className="mr-2 font-medium text-neutral-900">1.</span>
                    Create an account or sign in to{" "}
                    <a
                      href="https://openrouter.ai/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-neutral-900 underline underline-offset-2 hover:text-[#f36b3f]"
                    >
                      OpenRouter
                    </a>.
                  </li>

                  <li>
                    <span className="mr-2 font-medium text-neutral-900">2.</span>
                    Open the{" "}
                    <a
                      href="https://openrouter.ai/settings/keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-neutral-900 underline underline-offset-2 hover:text-[#f36b3f]"
                    >
                      API Keys page
                    </a>{" "}
                    and create a new key.
                  </li>

                  <li>
                    <span className="mr-2 font-medium text-neutral-900">3.</span>
                    Copy the generated key and paste it above. Keep it private.
                  </li>

                  <li>
                    <span className="mr-2 font-medium text-neutral-900">4.</span>
                    Browse the{" "}
                    <a
                      href="https://openrouter.ai/models"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-neutral-900 underline underline-offset-2 hover:text-[#f36b3f]"
                    >
                      available models
                    </a>{" "}
                    and enter your preferred model ID.
                  </li>
                </ol>

                <a
                  href="https://openrouter.ai/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex text-xs font-medium text-[#f36b3f] hover:underline"
                >
                  Read OpenRouter documentation
                  <span className="ml-1">↗</span>
                </a>
              </div>


              {apiKey && (
                <button
                  type="button"
                  onClick={handleClearApiKey}
                  className="text-xs font-medium text-red-600 transition-colors hover:text-red-700"
                >
                  Remove saved API key
                </button>
              )}
            </div>
          </section>

          {/* Query Permissions */}
          <section>
            <div className="mb-4 mt-6">
              <h3 className="text-sm font-semibold text-neutral-900">
                Query execution permissions
              </h3>
              <p className="mt-1 text-xs leading-5 text-neutral-500">
                Choose which database operations Queryline can perform.
              </p>
            </div>

            <div className="space-y-2">
              {permissionOptions.map((option) => {
                const isSelected = permission === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setPermission(option.value);
                      setSaved(false);
                    }}
                    className={`flex w-full items-start gap-3 border p-3 text-left transition-colors ${
                      isSelected
                        ? "border-[#f36b3f] bg-[#fff8f5]"
                        : "border-neutral-200 hover:border-neutral-300"
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border ${
                        isSelected
                          ? "border-[#f36b3f]"
                          : "border-neutral-300"
                      }`}
                    >
                      {isSelected && (
                        <span className="size-2 rounded-full bg-[#f36b3f]" />
                      )}
                    </span>

                    <span className="min-w-0">
                      <span className="block text-xs font-medium text-neutral-900">
                        {option.title}
                      </span>
                      <span className="mt-1 block text-[11px] leading-5 text-neutral-500">
                        {option.description}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        <div className="flex items-center justify-between border-t border-neutral-200 px-6 py-4">
          <p className="text-xs text-neutral-500">
            {saved
              ? "Settings saved locally and synced to server."
              : "Changes are not saved yet."}
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving || isValidating}
              className="h-9 border border-neutral-200 px-4 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || isValidating}
              className="h-9 bg-neutral-950 px-4 text-xs font-medium text-white transition-colors hover:bg-[#f36b3f] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? "Saving..." : "Save settings"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
