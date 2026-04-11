"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const MESSAGES = [
  "进度在列表里随时改～",
  "侧栏可按学校筛项目。",
  "有草稿就点进学校接着写。",
  "截止日前核对一下材料。",
  "加新项目：右上角加号。",
  "地图上圆点越大，申请越多。",
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

export function WorkspaceBuddy({ className }: { className?: string }) {
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

  useEffect(() => {
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
  }, [speak]);

  return (
    <div className={cn("relative flex shrink-0 flex-col gap-0", className)}>
      <div className="flex shrink-0 items-center gap-6 sm:gap-8">
        <button
          type="button"
          className="shrink-0 rounded-full ring-2 ring-border ring-offset-2 ring-offset-background transition hover:ring-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="我是你的申请助手，小布，点击查看提示"
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
      </div>
    </div>
  );
}
