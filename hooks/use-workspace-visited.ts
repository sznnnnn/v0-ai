"use client";

import { useSyncExternalStore } from "react";
import { readWorkspaceVisited, subscribeWorkspaceVisited } from "@/lib/workspace-visited";

export function useWorkspaceVisited(): boolean {
  return useSyncExternalStore(subscribeWorkspaceVisited, readWorkspaceVisited, () => false);
}
