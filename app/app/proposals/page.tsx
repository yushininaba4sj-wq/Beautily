"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, SectionTitle, Tag } from "@/components/Card";
import { useProfile } from "@/components/ProfileProvider";
import { buildRecommendationPlan } from "@/lib/recommendations";
import { loadPreferences } from "@/lib/storage";
import type { RecommendationPlan } from "@/lib/types";

function ListBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <Card>
      <p className="text-sm font-bold text-[var(--ink)]">{title}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {items.map((i) => (
          <Tag key={i}>{i}</Tag>
        ))}
      </div>
    </Card>
  );
}

export default function ProposalsPage() {
  const { profile } = useProfile();
  const [plan, setPlan] = useState<RecommendationPlan | null>(null);

  useEffect(() => {
    setPlan(buildRecommendationPlan(loadPreferences(profile), profile));
  }, [profile]);

  if (!profile && !plan?.preferences.skinTypes.length) {
    return (
      <div className="space-y-4">
        <SectionTitle title="美容提案" />
        <Card>
          <p className="text-sm text-[var(--muted)]">
            顔診断または肌・悩み・予算の設定を行ってください。
          </p>
          <div className="mt-3 flex flex-col gap-2">
            <Link href="/app/setup" className="text-sm font-bold text-[var(--rose-dark)]">
              肌・悩み・予算を設定 →
            </Link>
            <Link href="/app/scan" className="text-sm font-bold text-[var(--rose-dark)]">
              顔写真診断へ →
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <SectionTitle sub="Proposals" title="あなたに似合う提案" />

      {plan && (
        <Card className="bg-[var(--cream)]/40">
          <p className="text-sm font-bold">肌・悩み・予算ベース</p>
          <p className="mt-2 text-sm text-[var(--muted)]">{plan.summary}</p>
          <Link href="/app/recommend" className="mt-3 inline-block text-sm font-bold text-[var(--rose-dark)]">
            詳しいおすすめ商品を見る →
          </Link>
        </Card>
      )}

      {profile && (
        <>
          <Card>
            <p className="text-sm font-bold">似合うメイク</p>
            <div className="mt-3 space-y-3">
              {Object.entries(profile.makeup).map(([k, v]) => (
                <div key={k}>
                  <p className="text-xs text-[var(--muted)]">{k}</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {v.map((item) => (
                      <Tag key={item}>{item}</Tag>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <ListBlock title="似合う髪型" items={profile.hairStyle} />
          <ListBlock title="似合う髪色" items={profile.hairColor} />
          <ListBlock title="似合うファッション" items={profile.fashion} />
          <ListBlock title="似合う小物" items={profile.accessories} />
        </>
      )}

      <Link
        href="/app/setup"
        className="block rounded-xl border border-[var(--rose-light)] py-3 text-center text-sm font-bold"
      >
        肌・悩み・予算を変更
      </Link>
      <Link
        href="/app/simulate"
        className="block rounded-xl bg-gradient-to-r from-[var(--rose-dark)] to-[var(--rose)] py-3 text-center text-sm font-bold text-white"
      >
        着せ替えプレビューで試す →
      </Link>
    </div>
  );
}
