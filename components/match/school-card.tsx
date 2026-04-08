"use client";

import { MapPin, Trophy, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { School } from "@/lib/types";

interface SchoolCardProps {
  school: School;
  programCount: number;
  onClick: () => void;
  isSelected?: boolean;
}

const categoryLabels = {
  reach: { label: "冲刺", color: "bg-orange-100 text-orange-700 border-orange-200" },
  match: { label: "主申", color: "bg-blue-100 text-blue-700 border-blue-200" },
  safety: { label: "保底", color: "bg-green-100 text-green-700 border-green-200" },
};

export function SchoolCard({ school, programCount, onClick, isSelected }: SchoolCardProps) {
  const category = categoryLabels[school.category];
  
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left rounded-xl border-2 bg-card p-4 transition-all hover:shadow-md",
        isSelected ? "border-primary shadow-md" : "border-border hover:border-primary/50"
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className={cn("text-xs", category.color)}>
              {category.label}
            </Badge>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Trophy className="h-3 w-3" />
              QS #{school.ranking}
            </span>
          </div>
          
          <h3 className="font-semibold text-foreground truncate">{school.name}</h3>
          <p className="text-sm text-muted-foreground truncate">{school.nameEn}</p>
          
          <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            <span>{school.city}, {school.country}</span>
          </div>
          
          <p className="mt-2 text-sm text-primary font-medium">
            {programCount} 个匹配项目
          </p>
        </div>
        
        <ChevronRight className={cn(
          "h-5 w-5 text-muted-foreground transition-transform",
          isSelected && "rotate-90"
        )} />
      </div>
    </button>
  );
}
