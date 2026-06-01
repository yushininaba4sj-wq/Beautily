"use client";

import { useState } from "react";
import { Card, SectionTitle } from "@/components/Card";
import { useProfile } from "@/components/ProfileProvider";
import { shopVerdict } from "@/lib/diagnosis";

export default function ShopPage() {
  const { profile } = useProfile();
  const [note, setNote] = useState("");
  const [result, setResult] = useState<{
    verdict: string;
    reason: string;
  } | null>(null);

  const judge = () => {
    const r = shopVerdict(note || "商品", profile);
    setResult(r);
  };

  const colors: Record<string, string> = {
    似合う: "bg-emerald-100 text-emerald-800",
    普通: "bg-amber-100 text-amber-800",
    あまりおすすめしない: "bg-rose-100 text-rose-800",
  };

  return (
    <div className="space-y-5">
      <SectionTitle sub="Shopping" title="AI買い物同行" />
      <p className="-mt-2 text-sm text-[var(--muted)]">
        服やコスメの商品名・特徴を入力（画像は今後対応）。似合うか理由付きで判定します。
      </p>

      <Card>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="例：くすみピンクのニット、Vネック、ゆったりめ"
          rows={4}
          className="w-full resize-none rounded-xl border border-[var(--rose-light)]/40 bg-[var(--cream)]/30 p-3 text-sm outline-none"
        />
        <button
          type="button"
          onClick={judge}
          className="mt-3 w-full rounded-xl bg-[var(--ink)] py-3 text-sm font-bold text-white"
        >
          似合うか診断
        </button>
      </Card>

      {result && (
        <Card>
          <span
            className={`inline-block rounded-full px-3 py-1 text-sm font-bold ${colors[result.verdict] || ""}`}
          >
            {result.verdict}
          </span>
          <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">{result.reason}</p>
        </Card>
      )}
    </div>
  );
}
