"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MESSAGES = [
  "进度可以随时在列表里更新～",
  "侧栏能按学校筛选，找项目更快。",
  "有文书草稿的项目，点进学校就能接着写。",
  "快到截止日的话，记得核对材料清单。",
  "想加新项目？点右上角加号。",
  "地图上的圆点越大，表示该校申请越多。",
];

/** 自动冒泡间隔：上一句收起后再等这么久说下一句 */
const AUTO_SPEAK_GAP_MIN_MS = 12_000;
const AUTO_SPEAK_GAP_MAX_MS = 22_000;
const MESSAGE_VISIBLE_MS = 6000;

function pickMessage(exclude?: string) {
  const pool = exclude ? MESSAGES.filter((m) => m !== exclude) : MESSAGES;
  if (pool.length === 0) return MESSAGES[0];
  return pool[Math.floor(Math.random() * pool.length)]!;
}

export function WorkspaceBuddy({
  className,
  welcomeDemoOpen = false,
  onWelcomeDemoDismiss,
}: {
  className?: string;
  /** 由侧栏「测试」等入口控制，展示申请管理工作台引导 */
  welcomeDemoOpen?: boolean;
  onWelcomeDemoDismiss?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSpokenRef = useRef("");

  const speak = useCallback((text?: string) => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    const next = text ?? pickMessage(lastSpokenRef.current);
    lastSpokenRef.current = next;
    setMessage(next);
    setOpen(true);
    hideTimerRef.current = setTimeout(() => {
      setOpen(false);
      hideTimerRef.current = null;
    }, MESSAGE_VISIBLE_MS);
  }, []);

  const dismissWelcome = useCallback(() => {
    onWelcomeDemoDismiss?.();
  }, [onWelcomeDemoDismiss]);

  useEffect(() => {
    if (!welcomeDemoOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismissWelcome();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [welcomeDemoOpen, dismissWelcome]);

  useEffect(() => {
    if (welcomeDemoOpen) return;
    const scheduleIds: ReturnType<typeof setTimeout>[] = [];
    const loop = () => {
      const id = setTimeout(() => {
        speak();
        loop();
      }, MESSAGE_VISIBLE_MS + AUTO_SPEAK_GAP_MIN_MS + Math.random() * (AUTO_SPEAK_GAP_MAX_MS - AUTO_SPEAK_GAP_MIN_MS));
      scheduleIds.push(id);
    };
    const first = setTimeout(() => {
      speak();
      loop();
    }, 2800 + Math.random() * 3200);
    scheduleIds.push(first);
    return () => {
      scheduleIds.forEach(clearTimeout);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [welcomeDemoOpen, speak]);

  return (
    <div className={cn("relative flex shrink-0 flex-col gap-0", className)}>
      <div className="flex shrink-0 items-center gap-6 sm:gap-8">
        <button
          type="button"
          className="shrink-0 rounded-full ring-2 ring-border ring-offset-2 ring-offset-background transition hover:ring-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="工作台小助手，点击查看提示"
          onClick={() => speak()}
        >
          <Image
            src="/workspace-buddy-avatar.png"
            alt=""
            width={40}
            height={40}
            className="h-10 w-10 scale-x-[-1] rounded-full object-cover object-[50%_15%]"
            aria-hidden
          />
        </button>
        {!welcomeDemoOpen && (
          <div
            role="status"
            aria-live="polite"
            className={cn(
              "min-w-0 max-w-[min(320px,calc(100vw-8rem))] rounded-xl border border-border/90 bg-card px-4 py-2.5 text-left text-sm leading-snug text-foreground transition-[opacity,transform] duration-300",
              open ? "opacity-100 translate-x-0" : "pointer-events-none opacity-0 -translate-x-2"
            )}
          >
            <span className="block font-medium">{message}</span>
          </div>
        )}
      </div>

      {welcomeDemoOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default bg-black/15 backdrop-blur-[0.5px] sm:bg-black/10"
            aria-label="关闭引导"
            onClick={dismissWelcome}
          />
          <div
            className="absolute left-0 top-full z-50 mt-2 w-[min(18rem,calc(100vw-2.5rem))] animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200"
            role="dialog"
            aria-modal="true"
            aria-labelledby="workspace-buddy-welcome-title"
            aria-describedby="workspace-buddy-welcome-desc"
          >
            <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/95 p-5 shadow-lg shadow-black/5 ring-1 ring-black/[0.04] backdrop-blur-sm dark:shadow-black/30 dark:ring-white/[0.06]">
              <div
                className="absolute -top-1.5 left-9 h-3 w-3 rotate-45 border-l border-t border-border/70 bg-card"
                aria-hidden
              />
              <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0" aria-hidden />
              <p
                id="workspace-buddy-welcome-title"
                className="text-[15px] font-semibold leading-tight tracking-tight text-foreground"
              >
                嗨，我是你的申请助手
              </p>
              <p
                id="workspace-buddy-welcome-desc"
                className="mt-3 text-sm leading-relaxed text-muted-foreground"
              >
                在这里跟进选校和申请进度。细节随时点头像，我会用小提示帮你。
              </p>
              <div className="mt-5">
                <Button
                  type="button"
                  size="sm"
                  className="w-full"
                  onClick={dismissWelcome}
                >
                  开始使用
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
