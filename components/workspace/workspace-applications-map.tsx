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
      <div className="flex aspect-square w-full max-w-[200px] items-center justify-center rounded-lg border border-border/60 bg-muted/[0.12] text-xs text-muted-foreground">
        地图加载中…
      </div>
    ),
  }
);

export function WorkspaceApplicationsMap(props: {
  pins: WorkspaceMapPin[];
  onSelectSchool?: (schoolId: string) => void;
  className?: string;
}) {
  if (props.pins.length === 0) return null;
  return <WorkspaceApplicationsMapImpl {...props} />;
}
