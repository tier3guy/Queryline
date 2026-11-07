"use client";

import { z } from "zod";
import { useState } from "react";
import Icon from "@/components/icons";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ConnectionTestResult } from "@/lib/database/types";
import { testConnection } from "@/features/connections/services/connection-api";
import { connectionTestSchema } from "@/features/connections/schemas/connection.schema";
import type { ConnectionTestInput } from "@/features/connections/schemas/connection.schema";

// interface ConnectionFormProps {
//   onSave: (values: ConnectionTestInput) => Promise<void> | void;
// }

const DATABASE_OPTIONS = [
  { label: "PostgreSQL", value: "postgresql", port: 5432 },
  { label: "MySQL", value: "mysql", port: 3306 },
  { label: "MariaDB", value: "mariadb", port: 3306 },
  { label: "MongoDB", value: "mongodb", port: 27017 },
  { label: "SQLite", value: "sqlite", port: 0 },
  { label: "SQL Server", value: "sqlserver", port: 1433 },
] as const;

export const ConnectionForm = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [result, setResult] = useState<ConnectionTestResult | null>(null);
  const [testedValues, setTestedValues] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<
    z.input<typeof connectionTestSchema>,
    unknown,
    ConnectionTestInput
  >({
    resolver: zodResolver(connectionTestSchema),
    defaultValues: {
      name: "",
      type: "postgresql",
      host: "localhost",
      port: 5432,
      database: "",
      username: "",
      password: "",
      ssl: false,
    },
  });

  const selectedType = useWatch({ control, name: "type" });
  const sslEnabled = useWatch({ control, name: "ssl" });
  const formValues = useWatch({ control });

  const handleDatabaseChange = (type: "postgresql" | "mysql") => {
    const selectedDatabase = DATABASE_OPTIONS.find(
      (database) => database.value === type,
    );

    setValue("type", type, { shouldValidate: true });
    setValue("port", selectedDatabase?.port ?? 5432, {
      shouldValidate: true,
    });

    setResult(null);
    setTestedValues(null);
  };

  const handleTestConnection = async (values: ConnectionTestInput) => {
    try {
      setLoading(true);
      setResult(null);
      setTestedValues(null);

      const response = await testConnection(values);

      setResult(response);

      if (response.success) {
        setTestedValues(JSON.stringify(values));
      }
    } catch (error) {
      setResult({
        success: false,
        message:
          error instanceof Error ? error.message : "Connection test failed.",
        testedAt: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConnection = async (values: ConnectionTestInput) => {
    if (testedValues !== JSON.stringify(values) || !result?.success) {
      setResult({
        success: false,
        message: "Please test the connection successfully before saving.",
        testedAt: new Date().toISOString(),
      });

      return;
    }

    try {
      setSaving(true);
    //   await onSave(values);
    } catch (error) {
      setResult({
        success: false,
        message:
          error instanceof Error ? error.message : "Unable to save connection.",
        testedAt: new Date().toISOString(),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-xl">
      <form onSubmit={handleSubmit(handleTestConnection)} className="space-y-7">
        {/* Header */}
        <div className="space-y-1">
          <h2 className="text-xl font-semibold tracking-tight">
            New Connection
          </h2>

          <p className="text-sm text-muted-foreground">
            Configure your database connection details.
          </p>
        </div>

        {/* Connection Details */}
        <section className="space-y-4">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold">General Information</h3>

            <p className="text-xs text-muted-foreground">
              Give your connection a recognizable name.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Connection Name</Label>

            <Input
              id="name"
              placeholder="e.g. Production Database"
              {...register("name")}
            />

            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Database Type</Label>

            <select
              id="type"
              value={selectedType}
              onChange={(event) =>
                handleDatabaseChange(
                  event.target.value as "postgresql" | "mysql",
                )
              }
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors focus:ring-2 focus:ring-ring"
            >
              {DATABASE_OPTIONS.map((database) => (
                <option key={database.value} value={database.value}>
                  {database.label}
                </option>
              ))}
            </select>
          </div>
        </section>

        {/* Connection Credentials */}
        <section className="space-y-4">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold">Connection Credentials</h3>

            <p className="text-xs text-muted-foreground">
              Enter your database server credentials.
            </p>
          </div>

          {/* Host and Port */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="host">Host</Label>

              <Input id="host" placeholder="localhost" {...register("host")} />

              {"host" in errors && errors.host && (
                <p className="text-xs text-destructive">
                  {errors.host.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="port">Port</Label>

              <Input
                id="port"
                type="number"
                placeholder="5432"
                {...register("port")}
              />

              {"port" in errors && errors.port && (
                <p className="text-xs text-destructive">
                  {errors.port.message}
                </p>
              )}
            </div>
          </div>

          {/* Database */}
          <div className="space-y-2">
            <Label htmlFor="database">Database Name</Label>

            <Input
              id="database"
              placeholder="my_database"
              {...register("database")}
            />

            {errors.database && (
              <p className="text-xs text-destructive">
                {errors.database.message}
              </p>
            )}
          </div>

          {/* Username */}
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>

            <Input
              id="username"
              placeholder="postgres"
              {...register("username")}
            />

            {"username" in errors && errors.username && (
              <p className="text-xs text-destructive">
                {errors.username.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>

            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter database password"
                className="pr-11"
                {...register("password")}
              />

              <button
                type="button"
                onClick={() => setShowPassword((previous) => !previous)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <Icon name="eye-off" size={17} />
                ) : (
                  <Icon name="eye" size={17} />
                )}
              </button>
            </div>

            {"password" in errors && errors.password && (
              <p className="text-xs text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>
        </section>

        {/* Advanced Settings */}
        <section className="space-y-4">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold">Advanced Settings</h3>

            <p className="text-xs text-muted-foreground">
              Configure additional connection options.
            </p>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-1">
              <Label htmlFor="ssl" className="cursor-pointer">
                SSL / TLS
              </Label>

              <p className="text-xs text-muted-foreground">
                Use an encrypted connection to the database.
              </p>
            </div>

            <button
              id="ssl"
              type="button"
              role="switch"
              aria-checked={sslEnabled}
              onClick={() =>
                setValue("ssl", !sslEnabled, {
                  shouldDirty: true,
                })
              }
              className={`relative h-6 w-11 rounded-full transition-colors ${
                sslEnabled ? "bg-primary" : "bg-muted-foreground/30"
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                  sslEnabled ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        </section>

        {/* Test Result */}
        {result && (
          <div
            className={`flex gap-3 rounded-lg border p-4 ${
              result.success
                ? "border-green-500/20 bg-green-500/5"
                : "border-destructive/20 bg-destructive/5"
            }`}
          >
            {result.success ? (
              <Icon
                name="checkmark-circle"
                className="mt-0.5 h-5 w-5 shrink-0 text-green-600"
              />
            ) : (
              <Icon
                name="alert-circle"
                className="mt-0.5 h-5 w-5 shrink-0 text-destructive"
              />
            )}

            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-sm font-medium">
                {result.success ? "Connection successful" : "Connection failed"}
              </p>

              <p className="text-xs text-muted-foreground">{result.message}</p>

              {result.success && (
                <div className="space-y-1 pt-2 text-xs text-muted-foreground">
                  <p>Latency: {result.latency} ms</p>
                  <p className="break-all">Server: {result.serverVersion}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-end">
          <Button
            type="submit"
            variant="outline"
            disabled={loading || saving}
            className="gap-2"
          >
            {loading ? (
              <>
                <Icon name="loading" className="h-4 w-4 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <Icon name="plug-socket" className="h-4 w-4" />
                Test Connection
              </>
            )}
          </Button>

          <Button
            type="button"
            disabled={
              loading ||
              saving ||
              !result?.success ||
              testedValues !== JSON.stringify(formValues)
            }
            onClick={handleSubmit(handleSaveConnection)}
            className="gap-2"
          >
            {saving ? (
              <>
                <Icon name="loading" className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Icon name="floppy-disk" className="h-4 w-4" />
                Save Connection
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
