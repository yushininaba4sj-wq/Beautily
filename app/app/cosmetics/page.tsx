"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, SectionTitle, Tag } from "@/components/Card";
import { useProfile } from "@/components/ProfileProvider";
import { buildRecommendationPlan, formatYen } from "@/lib/recommendations";
import { loadCosmetics, loadPreferences, saveCosmetics } from "@/lib/storage";
import type { CosmeticItem, RecommendationPlan } from "@/lib/types";

export default function CosmeticsPage() {
  const { profile } = useProfile();
  const [items, setItems] = useState<CosmeticItem[]>([]);
  const [name, setName] = useState("");
  const [plan, setPlan] = useState<RecommendationPlan | null>(null);

  useEffect(() => {
    setItems(loadCosmetics());
    setPlan(buildRecommendationPlan(loadPreferences(profile), profile));
  }, [profile]);

  const add = () => {
    if (!name.trim()) return;
    const next = [
      ...items,
      { id: "m_" + Date.now(), name: name.trim(), category: "リップ" },
    ];
    setItems(next);
    saveCosmetics(next);
    setName("");
  };

  const cosmetics = plan ? [...plan.skincare, ...plan.makeup] : [];
  const ownedNames = items.map((i) => i.name.toLowerCase());
  const missing = cosmetics.filter(
    (p) =>
      !ownedNames.some(
        (n) => n.includes(p.name.toLowerCase()) || p.name.toLowerCase().includes(n),
      ),
  );

  return (
    <div className="space-y-5">
      <SectionTitle title="コスメ管理" />

      <Card className="bg-[var(--cream)]/40">
        <p className="text-sm font-bold">肌・悩み・予算ベースのおすすめ</p>
        <p className="mt-2 text-xs text-[var(--muted)]">
          設定した条件から、スキンケア・メイクを予算内で提案します。
        </p>
        <Link
          href="/app/recommend"
          className="mt-3 inline-block text-sm font-bold text-[var(--rose-dark)]"
        >
          おすすめ一覧を見る →
        </Link>
      </Card>

      <Card>
        <div className="flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="コスメを登録"
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
        </div>
      </Card>

      {plan && (
        <>
          <Card>
            <p className="text-sm font-bold">おすすめコスメ（予算内）</p>
            <ul className="mt-3 space-y-2">
              {cosmetics.slice(0, 6).map((item) => (
                <li key={item.id} className="rounded-xl bg-[var(--cream)]/40 p-3 text-sm">
                  <div className="flex justify-between gap-2">
                    <p className="font-bold">
                      {item.brand} {item.name}
                    </p>
                    <p className="shrink-0 font-bold text-[var(--rose-dark)]">
                      {formatYen(item.price)}
                    </p>
                  </div>
                  <p className="mt-1 text-xs text-[var(--muted)]">{item.reason}</p>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <p className="text-sm font-bold">まだ足りないコスメ</p>
            {missing.length ? (
              <ul className="mt-2 space-y-1 text-sm text-[var(--muted)]">
                {missing.slice(0, 5).map((item) => (
                  <li key={item.id}>
                    · {item.category}：{item.brand} {item.name}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-[var(--muted)]">
                おすすめリストの主要アイテムは揃っています。
              </p>
            )}
          </Card>
        </>
      )}

      {profile && (
        <Card>
          <p className="text-sm font-bold">診断ベースのメイク提案</p>
          <ul className="mt-2 space-y-1 text-sm text-[var(--muted)]">
            <li>· 眉毛：{profile.makeup.眉毛?.[0]}</li>
            <li>· 目元メイク：{profile.makeup.目元メイク?.[0]}</li>
            <li>· リップ：{profile.makeup.リップ?.[0]}</li>
          </ul>
        </Card>
      )}
    </div>
  );
}
