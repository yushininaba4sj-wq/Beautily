"use client";

import Link from "next/link";
import { Card, Tag } from "@/components/Card";
import { formatYen } from "@/lib/recommendations";
import type { ProductRecommendation, RecommendationPlan } from "@/lib/types";

function ProductList({
  title,
  items,
  total,
  budgetNote,
}: {
  title: string;
  items: ProductRecommendation[];
  total: number;
  budgetNote: string;
}) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-[var(--ink)]">{title}</p>
          <p className="mt-1 text-xs text-[var(--muted)]">{budgetNote}</p>
        </div>
        <p className="text-sm font-bold text-[var(--rose-dark)]">{formatYen(total)}</p>
      </div>
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-[var(--muted)]">
          予算内の候補がありません。予算を上げるか条件を見直してください。
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="rounded-xl border border-[var(--rose-light)]/30 bg-[var(--cream)]/30 p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[10px] font-bold text-[var(--rose-dark)]">
                    {item.category} · {item.brand}
                  </p>
                  <p className="mt-0.5 text-sm font-bold text-[var(--ink)]">{item.name}</p>
                </div>
                <p className="shrink-0 text-sm font-bold">{formatYen(item.price)}</p>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-[var(--muted)]">
                {item.description}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-[var(--ink)]">
                <span className="font-bold text-[var(--rose-dark)]">おすすめ理由：</span>
                {item.reason}
              </p>
              <div className="mt-2 flex flex-wrap gap-1">
                {item.tags.map((tag) => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

export function RecommendationResults({ plan }: { plan: RecommendationPlan }) {
  const { preferences: prefs } = plan;

  return (
    <div className="space-y-5">
      <Card className="bg-gradient-to-br from-white to-[var(--cream)]">
        <p className="text-xs font-bold uppercase tracking-widest text-[var(--rose)]">
          Your Plan
        </p>
        <p className="mt-2 text-sm leading-relaxed text-[var(--ink)]">{plan.summary}</p>
        <div className="mt-4 grid grid-cols-2 gap-3 text-center">
          <div className="rounded-xl bg-white p-3 ring-1 ring-[var(--rose-light)]/25">
            <p className="text-[10px] text-[var(--muted)]">合計</p>
            <p className="mt-1 text-lg font-bold text-[var(--rose-dark)]">
              {formatYen(plan.grandTotal)}
            </p>
          </div>
          <div className="rounded-xl bg-white p-3 ring-1 ring-[var(--rose-light)]/25">
            <p className="text-[10px] text-[var(--muted)]">残り予算</p>
            <p className="mt-1 text-lg font-bold text-[var(--ink)]">
              {formatYen(plan.remainingBudget)}
            </p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Tag>{prefs.age}歳</Tag>
          <Tag>予算 {formatYen(prefs.monthlyBudget)}</Tag>
          {prefs.skinTypes.map((s) => (
            <Tag key={s}>{s}</Tag>
          ))}
          {prefs.concerns.map((s) => (
            <Tag key={s}>{s}</Tag>
          ))}
        </div>
      </Card>

      <ProductList
        title="スキンケア"
        items={plan.skincare}
        total={plan.skincareTotal}
        budgetNote="洗顔〜UVまで、肌質・悩みに合わせて選定"
      />
      <ProductList
        title="メイク"
        items={plan.makeup}
        total={plan.makeupTotal}
        budgetNote="ファンデ〜リップまで、パーソナルカラー対応"
      />
      <ProductList
        title="ファッション"
        items={plan.fashion}
        total={plan.fashionTotal}
        budgetNote="服・アクセまで、顔まわりと全体の印象を整える"
      />

      <div className="grid gap-2">
        <Link
          href="/app/setup"
          className="block rounded-xl border border-[var(--rose-light)] py-3 text-center text-sm font-bold"
        >
          条件を変更する
        </Link>
        <Link
          href="/app/simulate"
          className="block rounded-xl bg-[var(--ink)] py-3 text-center text-sm font-bold text-white"
        >
          似合うコーデを試す →
        </Link>
      </div>
    </div>
  );
}
