"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, SectionTitle } from "@/components/Card";
import { RecommendationResults } from "@/components/RecommendationResults";
import { useProfile } from "@/components/ProfileProvider";
import { buildRecommendationPlan, formatYen } from "@/lib/recommendations";
import { loadPreferences } from "@/lib/storage";
import type { RecommendationPlan } from "@/lib/types";

export default function RecommendPage() {
  const { profile } = useProfile();
  const [plan, setPlan] = useState<RecommendationPlan | null>(null);

  useEffect(() => {
    const prefs = loadPreferences(profile);
    setPlan(buildRecommendationPlan(prefs, profile));
  }, [profile]);

  if (!plan) {
    return <p className="text-sm text-[var(--muted)]">読み込み中…</p>;
  }

  const prefs = plan.preferences;

  return (
    <div className="space-y-5">
      <SectionTitle sub="Recommend" title="予算内のおすすめ" />

      <Card className="bg-[var(--cream)]/40">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-bold">現在の設定</p>
            <p className="mt-1 text-xs text-[var(--muted)]">
              {prefs.age}歳 · 合計 {formatYen(prefs.monthlyBudget)}
              {prefs.useCustomBudget && " · カテゴリ別予算"}
            </p>
          </div>
          <Link
            href="/app/setup"
            className="shrink-0 rounded-full bg-white px-3 py-1.5 text-[11px] font-bold text-[var(--rose-dark)] ring-1 ring-[var(--rose-light)]/40"
          >
            変更
          </Link>
        </div>
      </Card>

      <RecommendationResults plan={plan} />
    </div>
  );
}
