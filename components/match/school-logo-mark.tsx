"use client";

import { cn } from "@/lib/utils";
import type { School } from "@/lib/types";

const sizeClass = {
  xs: "h-4 w-4 min-h-4 min-w-4 text-[8px]",
  sm: "h-8 w-8 min-h-8 min-w-8 text-[10px]",
  md: "h-9 w-9 min-h-9 min-w-9 text-xs",
  "md-wide": "h-9 w-9 min-h-9 min-w-9 text-ui-label",
  lg: "h-11 w-11 min-h-11 min-w-11 text-sm",
  /** 详情顶栏大徽标 */
  xl: "h-14 w-14 min-h-14 min-w-14 text-lg sm:h-[4.5rem] sm:min-h-[4.5rem] sm:w-[4.5rem] sm:min-w-[4.5rem] sm:text-xl",
  sidebar: "h-5 w-5 min-h-5 min-w-5 text-[9px]",
  row: "h-8 w-8 min-h-8 min-w-8 text-[10px]",
} as const;

export type SchoolLogoMarkSize = keyof typeof sizeClass;

type SchoolLogoMarkProps = {
  school?: Pick<School, "name" | "nameEn" | "logo"> | null;
  /** 优先于 school.logo（例如问卷按校名解析出的 favicon） */
  logoUrl?: string | null;
  /** 无图时用首字；默认取自 school */
  label?: string;
  size?: SchoolLogoMarkSize;
  rounded?: "md" | "lg" | "xl" | "full";
  className?: string;
  frameClassName?: string;
  /** 深色反色条上的学校行 */
  inverted?: boolean;
  title?: string;
};

export function SchoolLogoMark({
  school,
  logoUrl,
  label,
  size = "md",
  rounded = "lg",
  className,
  frameClassName,
  inverted,
  title,
}: SchoolLogoMarkProps) {
  const logo = logoUrl ?? school?.logo ?? undefined;
  const initialSource =
    label?.trim() ||
    school?.nameEn?.trim() ||
    school?.name?.trim() ||
    "?";
  const initial = (initialSource[0] ?? "?").toUpperCase();

  const round =
    rounded === "md"
      ? "rounded-md"
      : rounded === "lg"
        ? "rounded-lg"
        : rounded === "xl"
          ? "rounded-xl"
          : "rounded-full";

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden border",
        sizeClass[size],
        round,
        inverted
          ? "border-background/20 bg-background/10"
          : "border-border/80 bg-muted/40",
        frameClassName,
        className
      )}
      title={title}
      aria-hidden
    >
      {logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logo} alt="" className="h-full w-full object-contain p-0.5" />
      ) : (
        <span
          className={cn(
            "font-semibold leading-none",
            inverted ? "text-background" : "text-foreground/80"
          )}
        >
          {initial}
        </span>
      )}
    </div>
  );
}
