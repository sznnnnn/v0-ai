"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export type BubbleSpotlightStep = {
  targetSelector: string;
  title: string;
  description: string;
  /** Last step only: primary button label (default「完成」) */
  finishButtonLabel?: string;
  /** Padding around the highlighted box */
  padding?: number;
  /**
   * When the node is missing or has zero size, still show the tour bubble
   * with a full-screen dim (no cutout) so copy can explain a prerequisite.
   */
  allowMissingTarget?: boolean;
};

type BubbleSpotlightTourProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  steps: BubbleSpotlightStep[];
  finishStorageKey: string;
  /** Base z-index; overlay uses z, bubble uses z+1 */
  zIndex?: number;
};

function readRect(el: Element, pad: number) {
  const r = el.getBoundingClientRect();
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  if (r.width <= 1 || r.height <= 1) return null;
  const top = Math.max(0, r.top - pad);
  const left = Math.max(0, r.left - pad);
  const right = Math.min(vw, r.right + pad);
  const bottom = Math.min(vh, r.bottom + pad);
  if (right <= left || bottom <= top) return null;
  return { top, left, right, bottom, width: right - left, height: bottom - top };
}

export function BubbleSpotlightTour({
  open,
  onOpenChange,
  steps,
  finishStorageKey,
  zIndex = 60,
}: BubbleSpotlightTourProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [layoutTick, setLayoutTick] = useState(0);
  const [hole, setHole] = useState<{
    top: number;
    left: number;
    right: number;
    bottom: number;
  } | null>(null);
  const [bubbleStyle, setBubbleStyle] = useState<CSSProperties>({});
  const [useSpotlight, setUseSpotlight] = useState(true);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const primaryBtnRef = useRef<HTMLButtonElement>(null);

  const finish = useCallback(() => {
    try {
      localStorage.setItem(finishStorageKey, "1");
    } catch {
      /* ignore */
    }
    onOpenChange(false);
    setStepIndex(0);
  }, [finishStorageKey, onOpenChange]);

  const step = steps[stepIndex];
  const total = steps.length;
  const isLast = stepIndex >= total - 1;

  const bumpLayout = useCallback(() => {
    setLayoutTick((t) => t + 1);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onScroll = () => bumpLayout();
    const onResize = () => bumpLayout();
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
    };
  }, [open, bumpLayout]);

  useLayoutEffect(() => {
    if (!open || !step) {
      setHole(null);
      return;
    }
    const pad = step.padding ?? 10;
    const el = document.querySelector(step.targetSelector);
    const rect = el ? readRect(el, pad) : null;

    if (!rect && !step.allowMissingTarget) {
      if (stepIndex < total - 1) {
        setStepIndex((i) => i + 1);
      } else {
        finish();
      }
      return;
    }

    if (!rect) {
      setUseSpotlight(false);
      setHole(null);
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const bw = Math.min(360, vw - 32);
      setBubbleStyle({
        position: "fixed",
        left: Math.max(16, (vw - bw) / 2),
        top: Math.min(vh - 200, Math.max(96, vh * 0.38)),
        width: bw,
        zIndex: zIndex + 1,
      });
      return;
    }

    setUseSpotlight(true);
    setHole({ top: rect.top, left: rect.left, right: rect.right, bottom: rect.bottom });

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const bw = Math.min(360, vw - 32);
    const bh = 200;
    const margin = 16;
    const preferBelow = rect.bottom + margin + 160 < vh;
    let top = preferBelow ? rect.bottom + margin : rect.top - bh - margin;
    if (top + bh > vh - margin) top = vh - margin - bh;
    if (top < margin) top = margin;
    let left = rect.left + rect.width / 2 - bw / 2;
    if (left < margin) left = margin;
    if (left + bw > vw - margin) left = vw - margin - bw;

    setBubbleStyle({
      position: "fixed",
      left,
      top,
      width: bw,
      zIndex: zIndex + 1,
    });

    if (el instanceof HTMLElement) {
      el.scrollIntoView({ block: "center", inline: "nearest", behavior: "smooth" });
    }
  }, [open, step, stepIndex, layoutTick, zIndex, total, finish]);

  useEffect(() => {
    if (!open) {
      setStepIndex(0);
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        finish();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, finish]);

  useLayoutEffect(() => {
    if (!open) return;
    primaryBtnRef.current?.focus();
  }, [open, stepIndex]);

  const goNext = () => {
    if (isLast) finish();
    else setStepIndex((i) => i + 1);
  };

  const goPrev = () => {
    setStepIndex((i) => Math.max(0, i - 1));
  };

  if (!open || !step || typeof document === "undefined") return null;

  const overlayBg = "bg-foreground/45 dark:bg-background/70";

  const cutout =
    useSpotlight && hole ? (
      <>
        <div
          className={cn("fixed left-0 right-0 top-0", overlayBg)}
          style={{ height: hole.top, zIndex }}
          aria-hidden
        />
        <div
          className={cn("fixed left-0", overlayBg)}
          style={{ top: hole.top, width: hole.left, height: hole.bottom - hole.top, zIndex }}
          aria-hidden
        />
        <div
          className={cn("fixed right-0", overlayBg)}
          style={{ top: hole.top, left: hole.right, height: hole.bottom - hole.top, zIndex }}
          aria-hidden
        />
        <div
          className={cn("fixed bottom-0 left-0 right-0", overlayBg)}
          style={{ top: hole.bottom, zIndex }}
          aria-hidden
        />
      </>
    ) : (
      <div className={cn("fixed inset-0", overlayBg)} style={{ zIndex }} aria-hidden />
    );

  const panel = (
    <div className="pointer-events-none fixed inset-0" style={{ zIndex: zIndex + 1 }}>
      <div
        ref={bubbleRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="bubble-spotlight-title"
        className="pointer-events-auto rounded-xl border border-border bg-card p-4 shadow-lg"
        style={bubbleStyle}
      >
        <div className="mb-3 flex items-start justify-between gap-2">
          <p className="text-[11px] font-medium tabular-nums text-muted-foreground">
            {stepIndex + 1}/{total}
          </p>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 -mr-1 -mt-1"
            aria-label="关闭引导"
            onClick={finish}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <h2 id="bubble-spotlight-title" className="text-sm font-semibold leading-snug text-foreground">
          {step.title}
        </h2>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{step.description}</p>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <Button type="button" variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={finish}>
            跳过
          </Button>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              disabled={stepIndex === 0}
              onClick={goPrev}
            >
              上一步
            </Button>
            <Button ref={primaryBtnRef} type="button" size="sm" className="h-8 text-xs" onClick={goNext}>
              {isLast ? step.finishButtonLabel ?? "完成" : "下一步"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(
    <>
      {cutout}
      {panel}
    </>,
    document.body
  );
}
