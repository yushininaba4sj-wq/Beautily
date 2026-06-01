"use client";

import { useEffect, useState } from "react";
import { Card, SectionTitle, Tag } from "@/components/Card";
import { useProfile } from "@/components/ProfileProvider";
import { loadCosmetics, saveCosmetics } from "@/lib/storage";
import type { CosmeticItem } from "@/lib/types";

export default function CosmeticsPage() {
  const { profile } = useProfile();
  const [items, setItems] = useState<CosmeticItem[]>([]);
  const [name, setName] = useState("");

  useEffect(() => {
    setItems(loadCosmetics());
  }, []);

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

  return (
    <div className="space-y-5">
      <SectionTitle title="コスメ管理" />

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

      {profile && (
        <>
          <Card>
            <p className="text-sm font-bold">今日のメイク提案</p>
            <ul className="mt-2 space-y-1 text-sm text-[var(--muted)]">
              <li>· 眉毛：{profile.makeup.眉毛?.[0]}</li>
              <li>· 目元メイク：{profile.makeup.目元メイク?.[0]}</li>
              <li>· リップ：{profile.makeup.リップ?.[0]}</li>
              <li>· 肌：{profile.makeup.肌質?.[0]}</li>
            </ul>
          </Card>
          <Card>
            <p className="text-sm font-bold">不足コスメの提案</p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              涙袋ペン、{profile.personalColor}向けチーク、ローズベージュリップ
            </p>
          </Card>
        </>
      )}
    </div>
  );
}
