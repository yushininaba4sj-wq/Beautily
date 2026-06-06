"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, SectionTitle, Tag } from "@/components/Card";
import { useProfile } from "@/components/ProfileProvider";
import { buildRecommendationPlan, formatYen } from "@/lib/recommendations";
import { loadCloset, loadPreferences, saveCloset } from "@/lib/storage";
import type { ClosetItem, RecommendationPlan } from "@/lib/types";

export default function ClosetPage() {
  const { profile } = useProfile();
  const [items, setItems] = useState<ClosetItem[]>([]);
  const [name, setName] = useState("");
  const [plan, setPlan] = useState<RecommendationPlan | null>(null);

  useEffect(() => {
    setItems(loadCloset());
    setPlan(buildRecommendationPlan(loadPreferences(profile), profile));
  }, [profile]);

  const add = () => {
    if (!name.trim()) return;
    const next = [
      ...items,
      { id: "c_" + Date.now(), name: name.trim(), category: "トップス" },
    ];
    setItems(next);
    saveCloset(next);
    setName("");
  };

  const suggestions = plan
    ? [
        plan.summary,
        ...plan.fashion.slice(0, 2).map(
          (item) =>
            `「${item.name}」（${formatYen(item.price)}）— ${item.reason}`,
        ),
        items.length
          ? `登録${items.length}点と合わせて、トップス×ボトムスで着回し。`
          : "手持ち服を登録すると、おすすめとの組み合わせが分かります。",
      ]
    : ["肌・悩み・予算を設定するとコーデ提案が有効になります。"];

  return (
    <div className="space-y-5">
      <SectionTitle title="クローゼット" />

      <Card className="bg-[var(--cream)]/40">
        <p className="text-sm font-bold">予算内のファッション提案</p>
        <Link href="/app/recommend" className="mt-2 inline-block text-sm font-bold text-[var(--rose-dark)]">
          服・アクセのおすすめを見る →
        </Link>
      </Card>

      <Card>
        <div className="flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="持っている服を登録"
            className="flex-1 rounded-xl border border-[var(--rose-light)]/40 px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={add}
            className="rounded-xl bg-[var(--rose-dark)] px-4 text-sm font-bold text-white"
          >
            追加
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {items.map((i) => (
            <Tag key={i.id}>{i.name}</Tag>
          ))}
          {!items.length && (
            <p className="text-xs text-[var(--muted)]">まだ登録がありません</p>
          )}
        </div>
      </Card>

      <Card>
        <p className="text-sm font-bold">コーデ提案</p>
        <ul className="mt-2 space-y-2">
          {suggestions.map((s) => (
            <li key={s} className="text-sm text-[var(--muted)]">
              · {s}
            </li>
          ))}
        </ul>
      </Card>

      {plan && plan.fashion.length > 0 && (
        <Card>
          <p className="text-sm font-bold">おすすめアイテム</p>
          <ul className="mt-3 space-y-2">
            {plan.fashion.map((item) => (
              <li key={item.id} className="rounded-xl bg-[var(--cream)]/40 p-3 text-sm">
                <div className="flex justify-between gap-2">
                  <p className="font-bold">{item.brand} {item.name}</p>
                  <p className="font-bold text-[var(--rose-dark)]">{formatYen(item.price)}</p>
                </div>
                <p className="mt-1 text-xs text-[var(--muted)]">{item.reason}</p>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
