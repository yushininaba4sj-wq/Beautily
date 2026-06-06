"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, SectionTitle } from "@/components/Card";
import { RecommendationResults } from "@/components/RecommendationResults";
import { useProfile } from "@/components/ProfileProvider";
import { buildRecommendationPlan } from "@/lib/recommendations";
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

  const hasInput =
    plan.preferences.skinTypes.length > 0 ||
    plan.preferences.concerns.length > 0 ||
    plan.preferences.personalColor;

  if (!hasInput) {
    return (
      <div className="space-y-4">
        <SectionTitle sub="Recommend" title="あなたへのおすすめ" />
        <Card>
          <p className="text-sm text-[var(--muted)]">
            まず肌質・悩み・年齢・予算を設定してください。
          </p>
          <Link
            href="/app/setup"
            className="mt-4 inline-block rounded-xl bg-[var(--rose-dark)] px-5 py-3 text-sm font-bold text-white"
          >
            設定する →
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <SectionTitle sub="Recommend" title="予算内のおすすめ" />
      <RecommendationResults plan={plan} />
    </div>
  );
}
