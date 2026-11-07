"use client";

import { useState } from "react";
import Icon from "@/components/icons";
import type { FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { testConnection } from "@/features/connections/services/connection-api";
import type {
  ConnectionTestResult,
  DatabaseConnectionConfig,
  DatabaseType,
} from "@/lib/database/types";

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
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[3px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="connect-database-title"
        className="flex max-h-[90dvh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl"
      >
        <div className="flex items-start justify-between border-b border-border px-6 py-5">
          <div>
            <h2
              id="connect-database-title"
              className="text-lg font-semibold tracking-tight"
            >
              Connect a database
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Add a database connection to your workspace.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <span className="text-xl leading-none">×</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
            <div className="space-y-2">
              <Label htmlFor="database-type">Database type</Label>

              <select
                id="database-type"
                value={databaseType}
                disabled={isTesting}
                onChange={(event) =>
                  handleDatabaseTypeChange(event.target.value as DatabaseType)
                }
                className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20"
              >
                {databaseOptions.map((database) => (
                  <option key={database.value} value={database.value}>
                    {database.label}
                  </option>
                ))}
              </select>

              <p className="text-xs text-muted-foreground">
                {selectedDatabase?.description}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="connection-name">Connection name</Label>
              <Input
                id="connection-name"
                placeholder="e.g. Production Database"
                value={form.name}
                disabled={isTesting}
                onChange={(event) => updateField("name", event.target.value)}
                required
              />
            </div>

            {isSQLite ? (
              <div className="space-y-2">
                <Label htmlFor="sqlite-file-path">Database file path</Label>
                <Input
                  id="sqlite-file-path"
                  placeholder="/path/to/database.sqlite"
                  value={form.filePath}
                  disabled={isTesting}
                  onChange={(event) =>
                    updateField("filePath", event.target.value)
                  }
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Enter the path accessible to the Queryline server.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-[1fr_120px] gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="database-host">Host</Label>
                    <Input
                      id="database-host"
                      placeholder="localhost"
                      value={form.host}
                      disabled={isTesting}
                      onChange={(event) =>
                        updateField("host", event.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="database-port">Port</Label>
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
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="database-name">Database name</Label>
                  <Input
                    id="database-name"
                    placeholder="my_database"
                    value={form.database}
                    disabled={isTesting}
                    onChange={(event) =>
                      updateField("database", event.target.value)
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="database-username">Username</Label>
                  <Input
                    id="database-username"
                    placeholder="Database username"
                    value={form.username}
                    disabled={isTesting}
                    onChange={(event) =>
                      updateField("username", event.target.value)
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="database-password">Password</Label>

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
                      className="pr-11"
                      required
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((previous) => !previous)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
                    >
                      <Icon name={showPassword ? "eye-off" : "eye"} size={17} />
                    </button>
                  </div>
                </div>

                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3">
                  <input
                    type="checkbox"
                    checked={form.ssl}
                    disabled={isTesting}
                    onChange={(event) =>
                      updateField("ssl", event.target.checked)
                    }
                    className="size-4 accent-orange-500"
                  />

                  <div>
                    <p className="text-sm font-medium">Enable SSL</p>
                    <p className="text-xs text-muted-foreground">
                      Use an encrypted database connection.
                    </p>
                  </div>
                </label>
              </>
            )}

            {isTesting && (
              <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
                <Icon name="loading" size={16} />
                Testing database connection...
              </div>
            )}

            {testResult?.success && !isTesting && (
              <div className="space-y-1 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
                <div className="flex items-center gap-2 text-sm font-medium text-emerald-600">
                  <Icon name="checkmark-circle" size={16} />
                  Connection successful
                </div>

                <p className="text-xs text-muted-foreground">
                  {testResult.message}
                </p>

                {testResult.latency !== undefined && (
                  <p className="text-xs text-muted-foreground">
                    Latency: {testResult.latency} ms
                  </p>
                )}

                {testResult.serverVersion && (
                  <p className="text-xs text-muted-foreground">
                    Server: {testResult.serverVersion}
                  </p>
                )}
              </div>
            )}

            {testError && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3">
                <div className="flex items-center gap-2 text-sm font-medium text-destructive">
                  <Icon name="alert-circle" size={16} />
                  Connection failed
                </div>

                <p className="mt-1 text-xs text-muted-foreground">
                  {testError}
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border bg-muted/20 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleTestConnection}
              disabled={!isFormValid || isTesting}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isTesting ? "Testing..." : "Test Connection"}
            </button>

            <button
              type="submit"
              disabled={!isSaveEnabled}
              className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Save Connection
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
