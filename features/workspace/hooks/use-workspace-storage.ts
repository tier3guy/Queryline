"use client";

import { useEffect, useState } from "react";
import {
  loadWorkspaceStorage,
  saveWorkspaceStorage,
} from "@/features/workspace/services/workspace-storage";

import type { WorkspaceStorage } from "@/features/workspace/types";

export function useWorkspaceStorage() {
  const [workspace, setWorkspace] = useState<WorkspaceStorage>({
    version: 1,
    connections: [],
    conversations: [],
    activeConnectionId: null,
    activeConversationId: null,
  });

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setWorkspace(loadWorkspaceStorage());
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    try {
      saveWorkspaceStorage(workspace);
    } catch (error) {
      console.error("Queryline persistence error:", error);
    }
  }, [workspace, isLoaded]);

  return {
    workspace,
    setWorkspace,
    isLoaded,
  };
};
