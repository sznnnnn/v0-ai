"use client";

import Image from "next/image";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

const STEP_MESSAGES: Record<number, string> = {
  1: "带*必填，信息尽量真实，方便选校和文书。",
  2: "学校、项目、入学年份可先写大概，随时能改。",
  3: "从高学历往下填；在读请勾「在读」并填预计毕业。",
  4: "没标化就空着；有就填最高分或计划考期。",
  5: "实习/全职都算；没有就选无或先跳过。",
  6: "角色、技术栈和量化成果写清楚更好。",
  7: "竞赛、奖学金挑重点写；没有就空着。",
  8: "语言、软件、证书，简述熟练度即可。",
  9: "最后几题：动机和经历，各写几句就够。",
};

const INTRO_MESSAGE = "我是你的申请助手，怎么称呼你？";

export function QuestionnaireBuddy({
  mode,
  currentStep,
  displayName,
  className,
}: {
  mode: "intro" | "questionnaire";
  currentStep?: number;
  /** 问卷流程中用于气泡开头的称呼 */
  displayName?: string;
  className?: string;
}) {
  const message = useMemo(() => {
    if (mode === "intro") return INTRO_MESSAGE;
    const step = currentStep ?? 1;
    const tip = STEP_MESSAGES[step] ?? STEP_MESSAGES[1]!;
    const name = displayName?.trim();
    if (name) return `${name}，${tip}`;
    return tip;
  }, [mode, currentStep, displayName]);

  const rootLayout =
    mode === "intro"
      ? "flex w-full flex-row items-start gap-3"
      : "flex w-full flex-row items-start gap-3 sm:gap-4 lg:flex-col lg:items-stretch lg:gap-3";

  const bubbleLayout =
    mode === "intro"
      ? "min-w-0 flex-1 max-w-none"
      : "min-w-0 flex-1 max-w-[min(36rem,calc(100vw-4.5rem))] lg:w-full lg:max-w-none lg:flex-none";

  return (
    <div className={cn(rootLayout, className)}>
      <div className="shrink-0 rounded-full ring-2 ring-border ring-offset-2 ring-offset-background">
        <Image
          src="/workspace-buddy-avatar.png"
          alt=""
          width={40}
          height={40}
          className="h-10 w-10 scale-x-[-1] rounded-full object-cover object-[50%_15%]"
          aria-hidden
        />
      </div>
      <div
        role="status"
        aria-live="polite"
        className={cn(
          "rounded-xl border border-border/90 bg-card px-4 py-3 text-left shadow-sm",
          bubbleLayout
        )}
      >
        <div
          key={message}
          className="animate-in fade-in slide-in-from-bottom-1 duration-300"
        >
          <p className="text-xs font-medium leading-snug text-muted-foreground">小布</p>
          <p className="mt-1.5 text-sm leading-relaxed text-foreground">{message}</p>
        </div>
      </div>
    </div>
  );
}
