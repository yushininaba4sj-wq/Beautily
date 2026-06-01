"use client";

import Link from "next/link";
import { SectionTitle } from "@/components/Card";

const items = [
  { href: "/app/simulate", label: "AIシミュレーション", icon: "✨" },
  { href: "/app/advisor", label: "AI美容秘書", icon: "💬" },
  { href: "/app/shop", label: "AI買い物同行", icon: "🛍" },
  { href: "/app/closet", label: "AIクローゼット", icon: "👗" },
  { href: "/app/cosmetics", label: "AIコスメ管理", icon: "💄" },
  { href: "/app/salon", label: "美容院サポート", icon: "✂️" },
  { href: "/app/roadmap", label: "垢抜けロードマップ", icon: "📈" },
  { href: "/app/share", label: "診断結果シェア", icon: "📱" },
];

export default function MenuPage() {
  return (
    <div className="space-y-5">
      <SectionTitle sub="All Features" title="機能メニュー" />
      <p className="-mt-2 text-sm text-[var(--muted)]">
        分析・提案・シミュレーション・買い物・コーデ・美容相談まで一気通貫。
      </p>
      <div className="grid gap-2">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-4 rounded-2xl bg-white px-4 py-4 ring-1 ring-[var(--rose-light)]/25"
          >
            <span className="text-2xl">{item.icon}</span>
            <span className="flex-1 text-sm font-bold text-[var(--ink)]">{item.label}</span>
            <span className="text-[var(--muted)]">→</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
