"use client";

import { MapPin, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { School } from "@/lib/types";
import { SchoolLogoMark } from "@/components/match/school-logo-mark";

const categoryCn: Record<School["category"], string> = {
  reach: "冲刺",
  match: "主申",
  safety: "保底",
};

type SchoolNotionCoverProps = {
  school: School;
  className?: string;
};

export function SchoolNotionCover({ school, className }: SchoolNotionCoverProps) {
  return (
    <div className={cn("overflow-hidden border-b border-border/80", className)}>
      <div className="bg-muted/[0.14] px-4 py-5 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
          <SchoolLogoMark school={school} size="xl" rounded="xl" />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">当前院校</p>
            <h2 className="mt-1 text-xl font-semibold leading-tight tracking-tight text-foreground sm:text-2xl">
              {school.nameEn}
            </h2>
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
              <span className="inline-flex min-w-0 items-center gap-1.5 text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
                <span className="min-w-0">
                  {school.city} · {school.country}
                </span>
              </span>
              <Badge variant="outline" className="h-6 shrink-0 font-normal">
                {categoryCn[school.category]}
              </Badge>
              <span className="inline-flex items-center gap-1.5 tabular-nums text-foreground/90">
                <Trophy className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                排名 {school.ranking}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
