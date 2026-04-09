"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const MESSAGES = [
  "进度可以随时在列表里更新～",
  "侧栏能按学校筛选，找项目更快。",
  "有文书草稿的项目，点进学校就能接着写。",
  "快到截止日的话，记得核对材料清单。",
  "想加新项目？点右上角加号。",
  "地图上的圆点越大，表示该校申请越多。",
];

function pickMessage(exclude?: string) {
  const pool = exclude ? MESSAGES.filter((m) => m !== exclude) : MESSAGES;
  if (pool.length === 0) return MESSAGES[0];
  return pool[Math.floor(Math.random() * pool.length)]!;
}

export function WorkspaceBuddy({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const speak = useCallback((text?: string) => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    setMessage(text ?? pickMessage());
    setOpen(true);
    hideTimerRef.current = setTimeout(() => {
      setOpen(false);
      hideTimerRef.current = null;
    }, 5200);
  }, []);

  useEffect(() => {
    const scheduleIds: ReturnType<typeof setTimeout>[] = [];
    const loop = () => {
      const id = setTimeout(() => {
        speak();
        loop();
      }, 10000 + Math.random() * 14000);
      scheduleIds.push(id);
    };
    const first = setTimeout(() => {
      speak();
      loop();
    }, 4500 + Math.random() * 5500);
    scheduleIds.push(first);
    return () => {
      scheduleIds.forEach(clearTimeout);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [speak]);

  return (
    <div className={cn("relative shrink-0", className)}>
      <div
        role="status"
        aria-live="polite"
        className={cn(
          "absolute bottom-[calc(100%+10px)] right-0 z-10 w-max max-w-[min(260px,calc(100vw-2rem))] rounded-xl border border-border bg-background px-3 py-2 text-left text-xs leading-snug text-foreground shadow-md transition-[opacity,transform] duration-300",
          open
            ? "opacity-100 translate-y-0"
            : "pointer-events-none opacity-0 translate-y-1"
        )}
      >
        <span className="block pr-0.5">{message}</span>
        <span
          className="absolute -bottom-1 right-6 h-2 w-2 rotate-45 border-b border-r border-border bg-background"
          aria-hidden
        />
      </div>
      <button
        type="button"
        className="rounded-full ring-2 ring-border ring-offset-2 ring-offset-background transition hover:ring-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="工作台小助手，点击查看提示"
        onClick={() => speak(pickMessage(message))}
      >
        <Image
          src="/workspace-buddy-avatar.png"
          alt=""
          width={56}
          height={56}
          className="h-14 w-14 rounded-full object-cover object-[50%_15%]"
          aria-hidden
        />
      </button>
    </div>
  );
}
