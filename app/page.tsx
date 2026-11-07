"use client";

import { useCallback } from "react";
import type { DatabaseConnectionConfig } from "@/lib/database/types";
import { ConnectionForm } from "@/features/connections/components/connection-form/connection-form";

export default function Page() {

  const handleSaveConnection = useCallback(
    (config: DatabaseConnectionConfig) => {
      const storageKey = "queryline-connections";

      const existingConnections = JSON.parse(
        localStorage.getItem(storageKey) ?? "[]",
      ) as (DatabaseConnectionConfig & { id: string; createdAt: string })[];

      const newConnection = {
        ...config,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };

      localStorage.setItem(
        storageKey,
        JSON.stringify([...existingConnections, newConnection]),
      );
    },
    [],
  );


  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h1 className="text-2xl font-bold mb-4">Welcome to the Dashboard</h1>
      <p className="text-gray-600">This is your dashboard where you can manage your settings and view your data.</p>
      <ConnectionForm onSave={handleSaveConnection}/>
    </div>
  );
}
