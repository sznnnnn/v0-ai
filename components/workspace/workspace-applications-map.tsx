"use client";

import dynamic from "next/dynamic";
import type { WorkspaceMapPin } from "./workspace-applications-map-impl";

export type { WorkspaceMapPin };

const WorkspaceApplicationsMapImpl = dynamic(
  () =>
    import("./workspace-applications-map-impl").then((mod) => ({
      default: mod.WorkspaceApplicationsMapImpl,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[3.5rem] w-full items-center justify-center rounded-md border border-border/60 bg-muted/[0.12] text-[10px] text-muted-foreground">
        地图加载中…
      </div>
    ),
  }
);

export function WorkspaceApplicationsMap(props: {
  pins: WorkspaceMapPin[];
  onSelectSchool?: (schoolId: string) => void;
  className?: string;
  compact?: boolean;
}) {
  if (props.pins.length === 0) return null;
  return <WorkspaceApplicationsMapImpl {...props} />;
}
