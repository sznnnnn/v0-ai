"use client";

import { AlertCircle } from "lucide-react";

export function GuestBanner() {
  return (
    <div className="sticky top-0 z-50 flex items-center justify-center gap-2 bg-primary/10 px-4 py-2 text-sm text-primary">
      <AlertCircle className="h-4 w-4" />
      <span className="font-medium">游客模式</span>
      <span className="text-primary/80">·</span>
      <span className="text-primary/80">数据仅本地保存</span>
    </div>
  );
}
