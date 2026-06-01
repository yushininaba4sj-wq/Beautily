"use client";

import Link from "next/link";
import { SectionTitle } from "@/components/Card";
import { useProfile } from "@/components/ProfileProvider";

const items = [
  { href: "/app/discover", label: "新しい私を探す", icon: "✦", requiresProfile: true },
  { href: "/app/timeline", label: "美容タイムライン", icon: "▤", requiresProfile: false },
  { href: "/app/scan", label: "顔写真診断", icon: "◎", requiresProfile: false },
  { href: "/app/proposals", label: "美容提案", icon: "✦", requiresProfile: true },
  { href: "/app/simulate", label: "シミュレーション", icon: "✨", requiresProfile: true },
  { href: "/app/advisor", label: "美容秘書", icon: "💬", requiresProfile: false },
  { href: "/app/shop", label: "買い物同行", icon: "🛍", requiresProfile: false },
  { href: "/app/closet", label: "クローゼット", icon: "👗", requiresProfile: false },
  { href: "/app/cosmetics", label: "コスメ管理", icon: "💄", requiresProfile: false },
  { href: "/app/salon", label: "美容院サポート", icon: "✂️", requiresProfile: true },
  { href: "/app/roadmap", label: "垢抜けロードマップ", icon: "📈", requiresProfile: true },
  { href: "/app/share", label: "診断結果シェア", icon: "📱", requiresProfile: true },
];

export default function MenuPage() {
  const { profile } = useProfile();

  return (
    <div className="space-y-5">
      <SectionTitle sub="All Features" title="機能メニュー" />
      <p className="-mt-2 text-sm text-[var(--muted)]">
        診断 → 新しい私を探す → シミュレーション → 完成形まで伴走。
      </p>
      <div className="grid gap-2">
        {items.map((item) => {
          const locked = item.requiresProfile && !profile;
          if (locked) {
            return (
              <div
                key={item.href}
                className="flex items-center gap-4 rounded-2xl bg-[var(--cream)]/60 px-4 py-4 opacity-80"
              >
                <span className="text-2xl grayscale">{item.icon}</span>
                <span className="flex-1 text-sm font-bold text-[var(--muted)]">
                  {item.label}
                </span>
                <span className="text-[10px] font-bold text-[var(--rose-dark)]">診断後</span>
              </div>
            );
          }
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-4 rounded-2xl bg-white px-4 py-4 ring-1 ring-[var(--rose-light)]/25"
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="flex-1 text-sm font-bold text-[var(--ink)]">{item.label}</span>
              <span className="text-[var(--muted)]">→</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
