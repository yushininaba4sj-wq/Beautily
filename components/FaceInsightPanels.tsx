"use client";

import { useState } from "react";
import { Card, ScoreBar, Tag } from "@/components/Card";
import {
  getCelebrityMatches,
  getFaceDeviationInsight,
} from "@/lib/faceInsights";
import type { BeautyProfile } from "@/lib/types";

type PanelId = "deviation" | "celebrity" | null;

function Chevron({ open }: { open: boolean }) {
  return (
    <span
      className={`text-[var(--muted)] transition-transform ${open ? "rotate-180" : ""}`}
      aria-hidden
    >
      ▼
    </span>
  );
}

export function FaceInsightPanels({ profile }: { profile: BeautyProfile }) {
  const [open, setOpen] = useState<PanelId>(null);
  const deviation = getFaceDeviationInsight(profile.charm);
  const celebrities = getCelebrityMatches(profile);

  const toggle = (id: PanelId) => {
    setOpen((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => toggle("deviation")}
        className="w-full text-left"
      >
        <Card className="card-hover ring-2 ring-transparent transition hover:ring-[var(--rose-light)]/50">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-[var(--rose-dark)]">顔面偏差値</p>
              <p className="font-display mt-1 text-3xl font-semibold text-[var(--ink)]">
                {deviation.overall}
              </p>
              <p className="mt-1 text-xs text-[var(--muted)]">
                {deviation.rankLabel} · タップして詳しく
              </p>
            </div>
            <Chevron open={open === "deviation"} />
          </div>
          {open !== "deviation" && (
            <p className="mt-3 line-clamp-2 text-sm text-[var(--muted)]">
              {deviation.summary}
            </p>
          )}
        </Card>
      </button>

      {open === "deviation" && (
        <Card className="border border-[var(--rose-light)]/60 bg-[var(--cream)]/30">
          <p className="text-sm leading-relaxed text-[var(--ink)]">{deviation.summary}</p>
          <p className="mt-3 text-xs font-bold text-[var(--ink)]">項目別の偏差値</p>
          <div className="mt-3 space-y-4">
            {deviation.metrics.map((m) => (
              <div
                key={m.label}
                className="rounded-xl bg-white p-3 ring-1 ring-[var(--rose-light)]/20"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold">{m.label}</p>
                  <p className="text-sm">
                    <span className="font-bold text-[var(--rose-dark)]">{m.deviation}</span>
                    <span className="ml-2 text-[10px] text-[var(--muted)]">
                      (スコア {m.score})
                    </span>
                  </p>
                </div>
                <ScoreBar label={m.label} value={m.score} />
                <p className="mt-2 text-xs text-[var(--muted)]">{m.description}</p>
                <p className="mt-1 text-xs text-[var(--ink)]">→ {m.tip}</p>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setOpen(null)}
            className="mt-4 w-full text-center text-xs font-bold text-[var(--rose-dark)]"
          >
            閉じる
          </button>
        </Card>
      )}

      <button
        type="button"
        onClick={() => toggle("celebrity")}
        className="w-full text-left"
      >
        <Card className="card-hover ring-2 ring-transparent transition hover:ring-[var(--rose-light)]/50">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-[var(--rose-dark)]">似ている有名人</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {profile.celebrities.map((c) => (
                  <Tag key={c}>{c}</Tag>
                ))}
              </div>
              <p className="mt-2 text-xs text-[var(--muted)]">タップして似ている理由を見る</p>
            </div>
            <Chevron open={open === "celebrity"} />
          </div>
        </Card>
      </button>

      {open === "celebrity" && (
        <Card className="border border-[var(--rose-light)]/60 bg-[var(--cream)]/30">
          <p className="text-xs text-[var(--muted)]">
            診断結果（{profile.faceType}・{profile.animalFace}）に基づく参考マッチです。
          </p>
          <div className="mt-4 space-y-4">
            {celebrities.map((celeb) => (
              <div
                key={celeb.name}
                className="rounded-xl bg-white p-4 ring-1 ring-[var(--rose-light)]/20"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-display text-lg font-semibold">{celeb.name}</p>
                  <span className="shrink-0 rounded-full bg-[var(--rose-dark)] px-2.5 py-1 text-[10px] font-bold text-white">
                    類似 {celeb.similarityPercent}%
                  </span>
                </div>
                <p className="mt-2 text-sm text-[var(--muted)]">{celeb.impression}</p>
                <p className="mt-3 text-xs font-bold">似ているポイント</p>
                <ul className="mt-1 space-y-1 text-sm text-[var(--ink)]">
                  {celeb.sharedTraits.map((t) => (
                    <li key={t}>· {t}</li>
                  ))}
                </ul>
                <p className="mt-3 text-xs font-bold text-[var(--rose-dark)]">おすすめの参考スタイル</p>
                <p className="mt-1 text-sm text-[var(--ink)]">{celeb.styleReference}</p>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setOpen(null)}
            className="mt-4 w-full text-center text-xs font-bold text-[var(--rose-dark)]"
          >
            閉じる
          </button>
        </Card>
      )}
    </div>
  );
}
