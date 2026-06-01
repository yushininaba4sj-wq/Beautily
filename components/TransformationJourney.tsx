"use client";

import Link from "next/link";
import type { JourneyStep } from "@/lib/newSelf";

export function TransformationJourney({ steps }: { steps: JourneyStep[] }) {
  const doneCount = steps.filter((s) => s.done).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-[var(--ink)]">変身ジャーニー</p>
        <p className="text-[10px] font-bold text-[var(--rose-dark)]">
          {doneCount} / {steps.length}
        </p>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-[var(--cream)]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[var(--rose-light)] to-[var(--rose-dark)] transition-all"
          style={{ width: `${(doneCount / steps.length) * 100}%` }}
        />
      </div>
      <div className="space-y-2">
        {steps.map((step, i) => (
          <Link
            key={step.id}
            href={step.href}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition ${
              step.done
                ? "bg-white ring-1 ring-[var(--rose-dark)]/25"
                : "bg-[var(--cream)]/80 ring-1 ring-[var(--rose-light)]/30"
            }`}
          >
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                step.done
                  ? "bg-[var(--rose-dark)] text-white"
                  : "bg-white text-[var(--muted)]"
              }`}
            >
              {step.done ? "✓" : i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-[var(--ink)]">{step.label}</p>
              <p className="text-[10px] text-[var(--muted)]">{step.desc}</p>
            </div>
            <span className="text-[var(--muted)]">→</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
