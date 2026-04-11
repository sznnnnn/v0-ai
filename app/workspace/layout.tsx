"use client";

import { useLayoutEffect, type ReactNode } from "react";
import { markWorkspaceVisited } from "@/lib/workspace-visited";

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  useLayoutEffect(() => {
    markWorkspaceVisited();
  }, []);
  return <>{children}</>;
}
