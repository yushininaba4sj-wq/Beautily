"use client";

import { useEffect, useState } from "react";
import { Card, SectionTitle, Tag } from "@/components/Card";
import { useProfile } from "@/components/ProfileProvider";
import { loadCloset, saveCloset } from "@/lib/storage";
import type { ClosetItem } from "@/lib/types";

export default function ClosetPage() {
  const { profile } = useProfile();
  const [items, setItems] = useState<ClosetItem[]>([]);
  const [name, setName] = useState("");

  useEffect(() => {
    setItems(loadCloset());
  }, []);

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

  const suggestions = profile
    ? [
        `今日は「${profile.matchingStyles[0]}」で、${profile.fashion[0]}×${profile.fashion[1] || "きれいめ"}がおすすめ。`,
        `登録${items.length}点から：白シャツ＋ハイウエストで着回し。`,
        `不足アイテム：淡色のニット、きれいめパンツ。`,
      ]
    : ["診断後にコーデ提案が有効になります。"];

  return (
    <div className="space-y-5">
      <SectionTitle title="クローゼット" />

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
    </div>
  );
}
