"use client";

import {
  Clock,
  DollarSign,
  Calendar,
  Plus,
  Check,
  ChevronDown,
  ChevronUp,
  FileText,
  ClipboardList,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { Program, School } from "@/lib/types";
import { SchoolLogoMark } from "@/components/match/school-logo-mark";
import { useState } from "react";

const categoryStyle: Record<Program["category"], string> = {
  reach: "bg-muted text-muted-foreground",
  match: "bg-muted text-muted-foreground",
  safety: "bg-muted text-muted-foreground",
};

interface ProgramCardProps {
  program: Program;
  school: School;
  isAdded?: boolean;
  onAdd?: () => void;
  onRemove?: () => void;
  showSchoolInHeader?: boolean;
  showSelectionAction?: boolean;
  onCardClick?: () => void;
}

export function ProgramCard({
  program,
  school,
  isAdded,
  onAdd,
  onRemove,
  showSchoolInHeader = true,
  showSelectionAction = true,
  onCardClick,
}: ProgramCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const deadlineShort = program.deadline.split("-").slice(1).join("/");

  return (
    <div
      role={onCardClick ? "button" : undefined}
      tabIndex={onCardClick ? 0 : undefined}
      onClick={onCardClick}
      onKeyDown={
        onCardClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onCardClick();
              }
            }
          : undefined
      }
      className={cn(
        "flex overflow-hidden rounded-xl transition-colors",
        onCardClick && "cursor-pointer",
        isAdded
          ? "border-2 border-foreground/45 bg-background"
          : "border border-border/80 bg-card/95 hover:border-border hover:bg-muted/25"
      )}
    >
      {isAdded && (
        <div className="w-1.5 shrink-0 bg-foreground/70" aria-hidden />
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="mb-1.5 flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    "inline-flex items-center rounded-sm px-1.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wide",
                    categoryStyle[program.category]
                  )}
                  title={program.degree}
                >
                  {program.degree}
                </span>
                {isAdded && (
                  <span className="rounded-sm border border-foreground/35 bg-background px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-foreground">
                    已选
                  </span>
                )}
                {showSchoolInHeader && (
                  <span className="truncate text-[11px] font-medium text-muted-foreground">
                    {school.nameEn}
                  </span>
                )}
              </div>
              <h3 className={cn("text-[15px] leading-snug tracking-tight text-foreground", isAdded ? "font-semibold" : "font-medium")}>
                {program.nameEn}
              </h3>
              <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{program.department}</p>
            </div>
            <div className="flex shrink-0 flex-wrap items-start justify-end gap-1.5">
              {showSelectionAction &&
                (isAdded ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="default"
                        size="icon"
                        className="h-8 w-8 shrink-0 rounded-md"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!confirm("确认从工作台移除该项目吗？")) {
                            return;
                          }
                          onRemove?.();
                        }}
                        aria-label="取消添加"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">取消添加</TooltipContent>
                  </Tooltip>
                ) : (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 shrink-0 rounded-md border-border/80 bg-background"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAdd?.();
                        }}
                        aria-label="添加到工作台"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">添加到工作台</TooltipContent>
                  </Tooltip>
                ))}
              {showSchoolInHeader && (
                <SchoolLogoMark
                  school={school}
                  size="row"
                  rounded="md"
                  title={school.nameEn}
                  frameClassName={cn(
                    isAdded && "border-foreground/25 ring-1 ring-foreground/10"
                  )}
                />
              )}
            </div>
          </div>

          <div
            className={cn(
              "mt-4 grid min-w-0 grid-cols-2 divide-x overflow-hidden rounded-lg border text-[11px] sm:grid-cols-3",
              isAdded
                ? "divide-border/80 border-foreground/25 bg-background"
                : "divide-border/80 border-border/80 bg-background/60"
            )}
            role="group"
          >
          <span
            className={cn(
              "inline-flex min-w-0 items-center gap-1.5 px-2 py-1.5",
              isAdded ? "bg-muted/15" : "bg-muted/15"
            )}
            aria-label={`学制 ${program.duration}`}
          >
            <Clock className="h-3.5 w-3.5 shrink-0 text-foreground/50" aria-hidden />
            <span className="tabular-nums text-foreground/90">{program.duration}</span>
          </span>
          <span
            className={cn(
              "inline-flex min-w-0 items-center gap-1.5 px-2 py-1.5",
              isAdded ? "bg-muted/15" : "bg-muted/15"
            )}
            aria-label={`截止 ${program.deadline}`}
          >
            <Calendar className="h-3.5 w-3.5 shrink-0 text-foreground/50" aria-hidden />
            <span className="tabular-nums text-foreground/90">{deadlineShort}</span>
          </span>
          <span
            className={cn(
              "col-span-2 inline-flex min-w-0 items-center gap-1.5 px-2 py-1.5 sm:col-span-1",
              isAdded ? "bg-muted/15" : "bg-muted/15"
            )}
            aria-label={`学费参考 ${program.tuition}`}
          >
            <DollarSign className="h-3.5 w-3.5 shrink-0 text-foreground/50" aria-hidden />
            <span className="truncate text-foreground/90">{program.tuition}</span>
          </span>
          </div>

          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{program.description}</p>
        </div>

        <div
          className={cn(
            "border-t",
            isAdded ? "border-foreground/20" : "border-border/80"
          )}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
                aria-expanded={isExpanded}
                aria-label={isExpanded ? "收起详情" : "展开详情"}
                className={cn(
                  "flex w-full items-center justify-center py-2 text-muted-foreground transition-colors",
                  isAdded ? "hover:bg-muted/30" : "hover:bg-muted/30"
                )}
              >
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">{isExpanded ? "收起详情" : "展开详情"}</TooltipContent>
          </Tooltip>

          {isExpanded && (
            <div
              className={cn(
                "space-y-3 border-t px-4 pb-4 pt-3",
                isAdded ? "border-foreground/20 bg-muted/15" : "border-border/80 bg-muted/20"
              )}
            >
              <div className="flex gap-2.5">
                <FileText
                  className="mt-0.5 h-4 w-4 shrink-0 text-foreground/45"
                  aria-hidden
                />
                <p className="text-xs leading-relaxed text-muted-foreground">{program.description}</p>
              </div>

              {program.curriculumNote && (
                <div className="flex gap-2.5">
                  <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-foreground/45" aria-hidden />
                  <p className="text-xs leading-relaxed text-muted-foreground">{program.curriculumNote}</p>
                </div>
              )}

              <div className="flex gap-2.5">
                <ClipboardList
                  className="mt-0.5 h-4 w-4 shrink-0 text-foreground/45"
                  aria-hidden
                />
                <ul className="min-w-0 flex-1 space-y-1">
                  {program.requirements.map((req, index) => (
                    <li key={index} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
