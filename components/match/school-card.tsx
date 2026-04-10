"use client";

import { Trophy, LayoutList, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SchoolLogoMark } from "@/components/match/school-logo-mark";
import { cn } from "@/lib/utils";
import type { School } from "@/lib/types";

const categoryCn: Record<School["category"], string> = {
  reach: "冲刺",
  match: "主申",
  safety: "保底",
};

interface SchoolCardProps {
  school: School;
  programCount: number;
  onSelect: () => void;
  isSelected?: boolean;
}

export function SchoolCard({
  school,
  programCount,
  onSelect,
  isSelected,
}: SchoolCardProps) {
  const inv = isSelected;

  return (
    <div
      className={cn(
        "min-h-[5.25rem] overflow-hidden rounded-lg border transition-colors",
        inv
          ? "border-foreground bg-background text-foreground"
          : "border-border/80 bg-card/95 hover:border-border hover:bg-muted/25"
      )}
    >
      <button
        type="button"
        onClick={onSelect}
        aria-label={`${school.nameEn}，${school.name}，${school.city}，${school.country}，排名 ${school.ranking}，${programCount} 个项目`}
        className="min-w-0 flex-1 px-3.5 py-3.5 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <div className="flex items-start gap-3.5" aria-hidden={true}>
          <SchoolLogoMark school={school} size="lg" inverted={inv} />
          <div className="min-w-0 flex-1">
            <p
              className={cn(
                "text-[15px] font-semibold leading-snug tracking-tight",
                inv ? "text-foreground" : "text-foreground"
              )}
            >
              {school.nameEn}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-xs">
              <span className="inline-flex min-w-0 items-center gap-1.5">
                <MapPin className={cn("h-4 w-4 shrink-0", inv ? "text-muted-foreground" : "text-muted-foreground")} aria-hidden />
                <span className={cn("line-clamp-1 min-w-0", inv ? "text-foreground/90" : "text-foreground/85")}>
                  {school.city} · {school.country}
                </span>
              </span>
              <Badge
                variant="outline"
                className={cn(
                  "h-6 shrink-0 border px-2 py-0 text-ui-label font-normal leading-none",
                  inv
                    ? "border-foreground/30 bg-muted/20 text-foreground/90"
                    : "border-border/80 text-muted-foreground"
                )}
              >
                {categoryCn[school.category]}
              </Badge>
            </div>
            <div className={cn("mt-2 flex flex-wrap items-center gap-2.5 text-xs", inv ? "text-muted-foreground" : "text-muted-foreground")}>
              <span className="inline-flex items-center gap-1.5 tabular-nums">
                <Trophy className={cn("h-4 w-4 shrink-0", inv ? "text-muted-foreground" : "text-muted-foreground")} />
                <span className={inv ? "text-foreground" : "text-foreground/80"}>{school.ranking}</span>
              </span>
              <span className={cn("h-3.5 w-px shrink-0", inv ? "bg-border" : "bg-border/80")} />
              <span className="inline-flex items-center gap-1.5 tabular-nums">
                <LayoutList className={cn("h-4 w-4 shrink-0", inv ? "text-muted-foreground" : "text-muted-foreground")} />
                <span className={inv ? "text-foreground" : "text-foreground/80"}>{programCount}</span>
              </span>
            </div>
          </div>
        </div>
      </button>
    </div>
  );
}
