"use client";

import { useCallback, useRef, useState } from "react";

type CompareSliderProps = {
  beforeSrc: string;
  afterSrc: string;
  beforeLabel?: string;
  afterLabel?: string;
  caption?: string;
};

export function CompareSlider({
  beforeSrc,
  afterSrc,
  beforeLabel = "Before",
  afterLabel = "After",
  caption,
}: CompareSliderProps) {
  const [pos, setPos] = useState(50);
  const dragging = useRef(false);
  const boxRef = useRef<HTMLDivElement>(null);

  const setFromClientX = useCallback((clientX: number) => {
    const el = boxRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const p = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.min(98, Math.max(2, p)));
  }, []);

  return (
    <div className="space-y-2">
      <div
        ref={boxRef}
        className="relative aspect-[3/4] w-full touch-none select-none overflow-hidden rounded-2xl bg-[var(--cream)] shadow-inner"
        onPointerDown={(e) => {
          dragging.current = true;
          setFromClientX(e.clientX);
          (e.target as HTMLElement).setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (dragging.current) setFromClientX(e.clientX);
        }}
        onPointerUp={() => {
          dragging.current = false;
        }}
        onPointerCancel={() => {
          dragging.current = false;
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={beforeSrc}
          alt={beforeLabel}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${pos}%` }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={afterSrc}
            alt={afterLabel}
            className="absolute inset-0 h-full w-full max-w-none object-cover"
            style={{ width: `${100 / (pos / 100)}%` }}
          />
        </div>
        <div
          className="absolute bottom-0 top-0 z-10 w-0.5 bg-white shadow-[0_0_8px_rgba(0,0,0,0.35)]"
          style={{ left: `${pos}%`, transform: "translateX(-50%)" }}
        >
          <div className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-xs font-bold text-[var(--ink)] shadow-lg">
            ⇔
          </div>
        </div>
        <span className="absolute left-2 top-2 rounded-full bg-black/45 px-2 py-0.5 text-[10px] font-bold text-white">
          {beforeLabel}
        </span>
        <span className="absolute right-2 top-2 rounded-full bg-[var(--rose-dark)]/90 px-2 py-0.5 text-[10px] font-bold text-white">
          {afterLabel}
        </span>
      </div>
      <p className="text-center text-[10px] text-[var(--muted)]">
        {caption || "スライダーを左右にドラッグして比較"}
      </p>
    </div>
  );
}
