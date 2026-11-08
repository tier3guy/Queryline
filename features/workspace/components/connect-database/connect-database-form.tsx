"use client";

import { useState } from "react";
import Icon from "@/components/icons";
import type { FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { testConnection } from "@/features/connections/services/connection-api";
import type { DatabaseType, ConnectionTestResult, DatabaseConnectionConfig } from "@/lib/database/types";

interface ConnectDatabaseFormProps {
  onClose: () => void;
  onConnect: (config: DatabaseConnectionConfig) => void;
  initialConfig?: DatabaseConnectionConfig | null;
}

interface FormState {
  name: string;
  host: string;
  port: string;
  database: string;
  username: string;
  password: string;
  filePath: string;
  ssl: boolean;
}

const databaseOptions: {
  value: DatabaseType;
  label: string;
  description: string;
  defaultPort?: string;
}[] = [
  {
    value: "postgresql",
    label: "PostgreSQL",
    description: "Connect to a PostgreSQL database.",
    defaultPort: "5432",
  },
  {
    value: "mysql",
    label: "MySQL",
    description: "Connect to a MySQL database.",
    defaultPort: "3306",
  },
  {
    value: "mariadb",
    label: "MariaDB",
    description: "Connect to a MariaDB database.",
    defaultPort: "3306",
  },
  {
    value: "mongodb",
    label: "MongoDB",
    description: "Connect to a MongoDB database.",
    defaultPort: "27017",
  },
  {
    value: "sqlite",
    label: "SQLite",
    description: "Connect using a SQLite database file.",
  },
  {
    value: "sqlserver",
    label: "SQL Server",
    description: "Connect to a Microsoft SQL Server database.",
    defaultPort: "1433",
  },
];

const initialFormState: FormState = {
  name: "",
  host: "localhost",
  port: "5432",
  database: "",
  username: "",
  password: "",
  filePath: "",
  ssl: false,
};

export default function ConnectDatabaseForm({
  onClose,
  onConnect,
  initialConfig = null,
}: ConnectDatabaseFormProps) {
  const [databaseType, setDatabaseType] = useState<DatabaseType>(
    initialConfig?.type ?? "postgresql",
  );

  const [form, setForm] = useState<FormState>(() => {
    if (!initialConfig) {
      return initialFormState;
    }

    if (initialConfig.type === "sqlite") {
      return {
        ...initialFormState,
        name: initialConfig.name,
        filePath: initialConfig.database,
      };
    }

    return {
      ...initialFormState,
      name: initialConfig.name,
      host: initialConfig.host,
      port: String(initialConfig.port),
      database: initialConfig.database,
      username: initialConfig.username,
      password: initialConfig.password,
      ssl: initialConfig.ssl,
    };
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<ConnectionTestResult | null>(
    null,
  );
  const [testError, setTestError] = useState<string | null>(null);

  const selectedDatabase = databaseOptions.find(
    (database) => database.value === databaseType,
  );

  const isSQLite = databaseType === "sqlite";
  const isSaveEnabled = testResult?.success === true && !isTesting;

  const isFormValid = Boolean(
    form.name.trim() &&
      (isSQLite
        ? form.filePath.trim()
        : form.host.trim() &&
          form.database.trim() &&
          form.username.trim() &&
          form.password &&
          Number.isInteger(Number(form.port)) &&
          Number(form.port) >= 1 &&
          Number(form.port) <= 65535),
  );

  const invalidateTest = () => {
    setTestResult(null);
    setTestError(null);
  };

  const updateField = <K extends keyof FormState>(
    field: K,
    value: FormState[K],
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    invalidateTest();
  };

  const handleDatabaseTypeChange = (type: DatabaseType) => {
    const selected = databaseOptions.find(
      (database) => database.value === type,
    );

    setDatabaseType(type);

    setForm((previous) => ({
      ...previous,
      port: selected?.defaultPort ?? "",
    }));

    invalidateTest();
  };

  const buildConnectionConfig = (): DatabaseConnectionConfig => {
    if (isSQLite) {
      return {
        type: "sqlite",
        name: form.name.trim(),
        database: form.filePath.trim(),
      };
    }

    const commonConfig = {
      name: form.name.trim(),
      host: form.host.trim(),
      port: Number(form.port),
      database: form.database.trim(),
      username: form.username.trim(),
      password: form.password,
      ssl: form.ssl,
    };

    switch (databaseType) {
      case "postgresql":
        return {
          type: "postgresql",
          ...commonConfig,
        };

      case "mysql":
        return {
          type: "mysql",
          ...commonConfig,
        };

      case "mariadb":
        return {
          type: "mariadb",
          ...commonConfig,
        };

      case "mongodb":
        return {
          type: "mongodb",
          ...commonConfig,
        };

      case "sqlserver":
        return {
          type: "sqlserver",
          ...commonConfig,
        };
    }
  };

  const handleTestConnection = async () => {
    if (!isFormValid || isTesting) {
      return;
    }

    setIsTesting(true);
    setTestResult(null);
    setTestError(null);

    try {
      const result = await testConnection(buildConnectionConfig());

      setTestResult(result);

      if (!result.success) {
        setTestError(result.message);
      }
    } catch (error) {
      setTestError(
        error instanceof Error
          ? error.message
          : "Unable to test the database connection.",
      );
    } finally {
      setIsTesting(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isSaveEnabled) {
      return;
    }

    onConnect(buildConnectionConfig());
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-neutral-950/50 p-4 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isTesting) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="connect-database-title"
        className="flex max-h-[90dvh] w-full max-w-lg flex-col overflow-hidden border border-neutral-200 bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between border-b border-neutral-200 px-6 py-5">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="size-1.5 bg-[#f36b3f]" />
              <span className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-neutral-500">
                Workspace / Connections
              </span>
            </div>

            <h2
              id="connect-database-title"
              className="text-lg font-semibold tracking-tight text-neutral-950"
            >
              {initialConfig ? "Edit connection" : "Connect a database"}
            </h2>

            <p className="mt-1 text-sm text-neutral-500">
              Configure your database connection details.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isTesting}
            aria-label="Close dialog"
            className="flex size-8 items-center justify-center border border-neutral-200 text-neutral-500 transition-colors hover:border-neutral-950 hover:text-neutral-950 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <span className="text-xl leading-none">×</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="database-type"
                  className="text-xs font-semibold uppercase tracking-wide text-neutral-700"
                >
                  Database type
                </Label>

                <span className="font-mono text-[10px] text-neutral-400">
                  STEP 01
                </span>
              </div>

              <select
                id="database-type"
                value={databaseType}
                disabled={isTesting}
                onChange={(event) =>
                  handleDatabaseTypeChange(event.target.value as DatabaseType)
                }
                className="h-10 w-full appearance-none border border-neutral-200 bg-white px-3 text-sm text-neutral-900 outline-none transition-colors focus:border-[#f36b3f] disabled:cursor-not-allowed disabled:bg-neutral-50"
              >
                {databaseOptions.map((database) => (
                  <option key={database.value} value={database.value}>
                    {database.label}
                  </option>
                ))}
              </select>

              <p className="text-xs text-neutral-500">
                {selectedDatabase?.description}
              </p>
            </section>

            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="connection-name"
                  className="text-xs font-semibold uppercase tracking-wide text-neutral-700"
                >
                  Connection details
                </Label>

                <span className="font-mono text-[10px] text-neutral-400">
                  STEP 02
                </span>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="connection-name"
                  className="text-xs text-neutral-600"
                >
                  Connection name
                </Label>

                <Input
                  id="connection-name"
                  placeholder="e.g. Production Database"
                  value={form.name}
                  disabled={isTesting}
                  onChange={(event) => updateField("name", event.target.value)}
                  className="h-10 rounded-none border-neutral-200 bg-white text-sm shadow-none placeholder:text-neutral-400 focus-visible:border-[#f36b3f] focus-visible:ring-0"
                  required
                />
              </div>
            </section>

            {isSQLite ? (
              <section className="space-y-2">
                <Label
                  htmlFor="sqlite-file-path"
                  className="text-xs text-neutral-600"
                >
                  Database file path
                </Label>

                <Input
                  id="sqlite-file-path"
                  placeholder="/path/to/database.sqlite"
                  value={form.filePath}
                  disabled={isTesting}
                  onChange={(event) =>
                    updateField("filePath", event.target.value)
                  }
                  className="h-10 rounded-none border-neutral-200 bg-white text-sm shadow-none placeholder:text-neutral-400 focus-visible:border-[#f36b3f] focus-visible:ring-0"
                  required
                />

                <p className="text-xs leading-relaxed text-neutral-500">
                  Enter the path accessible to the Queryline server.
                </p>
              </section>
            ) : (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-neutral-700">
                    Network configuration
                  </span>

                  <span className="font-mono text-[10px] text-neutral-400">
                    STEP 03
                  </span>
                </div>

                <div className="grid grid-cols-[1fr_112px] gap-3">
                  <div className="space-y-2">
                    <Label
                      htmlFor="database-host"
                      className="text-xs text-neutral-600"
                    >
                      Host
                    </Label>

                    <Input
                      id="database-host"
                      placeholder="localhost"
                      value={form.host}
                      disabled={isTesting}
                      onChange={(event) =>
                        updateField("host", event.target.value)
                      }
                      className="h-10 rounded-none border-neutral-200 bg-white text-sm shadow-none placeholder:text-neutral-400 focus-visible:border-[#f36b3f] focus-visible:ring-0"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="database-port"
                      className="text-xs text-neutral-600"
                    >
                      Port
                    </Label>

                    <Input
                      id="database-port"
                      type="number"
                      min="1"
                      max="65535"
                      placeholder="5432"
                      value={form.port}
                      disabled={isTesting}
                      onChange={(event) =>
                        updateField("port", event.target.value)
                      }
                      className="h-10 rounded-none border-neutral-200 bg-white text-sm shadow-none placeholder:text-neutral-400 focus-visible:border-[#f36b3f] focus-visible:ring-0"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="database-name"
                    className="text-xs text-neutral-600"
                  >
                    Database name
                  </Label>

                  <Input
                    id="database-name"
                    placeholder="my_database"
                    value={form.database}
                    disabled={isTesting}
                    onChange={(event) =>
                      updateField("database", event.target.value)
                    }
                    className="h-10 rounded-none border-neutral-200 bg-white text-sm shadow-none placeholder:text-neutral-400 focus-visible:border-[#f36b3f] focus-visible:ring-0"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="database-username"
                    className="text-xs text-neutral-600"
                  >
                    Username
                  </Label>

                  <Input
                    id="database-username"
                    placeholder="Database username"
                    value={form.username}
                    disabled={isTesting}
                    onChange={(event) =>
                      updateField("username", event.target.value)
                    }
                    className="h-10 rounded-none border-neutral-200 bg-white text-sm shadow-none placeholder:text-neutral-400 focus-visible:border-[#f36b3f] focus-visible:ring-0"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="database-password"
                    className="text-xs text-neutral-600"
                  >
                    Password
                  </Label>

                  <div className="relative">
                    <Input
                      id="database-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Database password"
                      value={form.password}
                      disabled={isTesting}
                      onChange={(event) =>
                        updateField("password", event.target.value)
                      }
                      className="h-10 rounded-none border-neutral-200 bg-white pr-11 text-sm shadow-none placeholder:text-neutral-400 focus-visible:border-[#f36b3f] focus-visible:ring-0"
                      required
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((previous) => !previous)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      disabled={isTesting}
                      className="absolute inset-y-0 right-0 flex items-center px-3 text-neutral-400 transition-colors hover:text-neutral-950 disabled:cursor-not-allowed"
                    >
                      <Icon
                        name={showPassword ? "eye-off" : "eye"}
                        size={16}
                      />
                    </button>
                  </div>
                </div>

                <label className="flex cursor-pointer items-start gap-3 border border-neutral-200 p-3 transition-colors hover:border-neutral-300">
                  <input
                    type="checkbox"
                    checked={form.ssl}
                    disabled={isTesting}
                    onChange={(event) =>
                      updateField("ssl", event.target.checked)
                    }
                    className="mt-0.5 size-4 accent-[#f36b3f]"
                  />

                  <div>
                    <p className="text-sm font-medium text-neutral-800">
                      Enable SSL
                    </p>
                    <p className="mt-0.5 text-xs text-neutral-500">
                      Use an encrypted database connection.
                    </p>
                  </div>
                </label>
              </section>
            )}

            {testResult?.success && !isTesting && (
              <div className="border border-emerald-200 bg-emerald-50/50 p-3">
                <div className="flex items-center gap-2 text-sm font-medium text-emerald-700">
                  <Icon name="checkmark-circle" size={16} />
                  Connection successful
                </div>

                <p className="mt-1 text-xs text-neutral-600">
                  {testResult.message}
                </p>

                {testResult.latency !== undefined && (
                  <p className="mt-2 font-mono text-xs text-neutral-500">
                    Latency: {testResult.latency} ms
                  </p>
                )}

                {testResult.serverVersion && (
                  <p className="mt-1 font-mono text-xs text-neutral-500">
                    Server: {testResult.serverVersion}
                  </p>
                )}
              </div>
            )}

            {testError && (
              <div className="border border-red-200 bg-red-50/50 p-3">
                <div className="flex items-center gap-2 text-sm font-medium text-red-700">
                  <Icon name="alert-circle" size={16} />
                  Connection failed
                </div>

                <p className="mt-1 text-xs leading-relaxed text-neutral-600">
                  {testError}
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-right gap-3 border-t border-neutral-200 bg-neutral-50/70 px-6 py-4">
            <p className="text-[11px] text-neutral-400">
              {isSaveEnabled
                ? "Connection verified."
                : "Test your connection before saving."}
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isTesting}
                className="h-9 border border-neutral-200 bg-white px-4 text-sm font-medium text-neutral-600 transition-colors hover:border-neutral-950 hover:text-neutral-950 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleTestConnection}
                disabled={!isFormValid || isTesting}
                className="inline-flex h-9 items-center justify-center gap-2 border border-neutral-300 bg-white px-4 text-sm font-medium text-neutral-800 transition-colors hover:border-neutral-950 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isTesting && (
                  <span className="inline-flex animate-spin">
                    <Icon name="loading" size={15} />
                  </span>
                )}

                {isTesting ? "Testing..." : "Test Connection"}
              </button>

              <button
                type="submit"
                disabled={!isSaveEnabled}
                className="h-9 bg-neutral-950 px-4 text-sm font-medium text-white transition-colors hover:bg-[#f36b3f] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Save Connection
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
