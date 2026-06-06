"use client";

import Link from "next/link";
import { Card, SectionTitle } from "@/components/Card";
import { useProfile } from "@/components/ProfileProvider";

const items = [
  {
    href: "/app/setup",
    label: "マイ設定",
    icon: "⚙",
    desc: "予算・肌質・悩みを自分で保存",
    requiresProfile: false,
    section: "おすすめ",
  },
  {
    href: "/app/recommend",
    label: "おすすめ商品",
    icon: "★",
    desc: "予算内のコスメ・服を提案",
    requiresProfile: false,
    section: "おすすめ",
  },
  {
    href: "/app/discover",
    label: "新しい私を探す",
    icon: "✦",
    desc: "3つの可能性と伸びしろをチェック",
    requiresProfile: true,
    section: "おすすめ",
  },
  {
    href: "/app/timeline",
    label: "美容SNSタイムライン",
    icon: "▤",
    desc: "自分に関連する投稿だけ見れる",
    requiresProfile: false,
    section: "おすすめ",
  },
  {
    href: "/app/simulate",
    label: "シミュレーション",
    icon: "✨",
    desc: "髪・メイク・服を写真で試す",
    requiresProfile: true,
    section: "おすすめ",
  },
  {
    href: "/app/scan",
    label: "顔写真診断",
    icon: "◎",
    desc: "まずは診断して精度を上げる",
    requiresProfile: false,
    section: "診断と記録",
  },
  {
    href: "/app/chart",
    label: "美容カルテ",
    icon: "☰",
    desc: "診断結果と魅力ポイントを確認",
    requiresProfile: true,
    section: "診断と記録",
  },
  {
    href: "/app/roadmap",
    label: "垢抜けロードマップ",
    icon: "📈",
    desc: "何からやるかを順番で表示",
    requiresProfile: true,
    section: "診断と記録",
  },
  {
    href: "/app/proposals",
    label: "美容提案",
    icon: "✦",
    desc: "似合うコーデ・メイク提案",
    requiresProfile: true,
    section: "実践",
  },
  {
    href: "/app/advisor",
    label: "美容秘書",
    icon: "💬",
    desc: "悩みを24時間相談",
    requiresProfile: false,
    section: "実践",
  },
  {
    href: "/app/shop",
    label: "買い物同行",
    icon: "🛍",
    desc: "買うべきアイテムを絞る",
    requiresProfile: false,
    section: "実践",
  },
  {
    href: "/app/closet",
    label: "クローゼット",
    icon: "👗",
    desc: "手持ち服を整理して活かす",
    requiresProfile: false,
    section: "実践",
  },
  {
    href: "/app/cosmetics",
    label: "コスメ管理",
    icon: "💄",
    desc: "持ちコスメと相性を管理",
    requiresProfile: false,
    section: "実践",
  },
  {
    href: "/app/salon",
    label: "美容院サポート",
    icon: "✂️",
    desc: "オーダー文を作って失敗防止",
    requiresProfile: true,
    section: "実践",
  },
  {
    href: "/app/share",
    label: "診断結果シェア",
    icon: "📱",
    desc: "SNS共有用テキストを作成",
    requiresProfile: true,
    section: "実践",
  },
];

export default function MenuPage() {
  const { profile } = useProfile();
  const sections = ["おすすめ", "診断と記録", "実践"] as const;

  return (
    <div className="space-y-5">
      <SectionTitle sub="All Features" title="機能メニュー" />
      <Card className="bg-[var(--cream)]/40">
        <p className="text-sm font-bold text-[var(--ink)]">まずこれを使うと分かりやすい</p>
        <p className="mt-1 text-xs text-[var(--muted)]">
          診断 → 美容SNS → シミュレーション の順で使うと、迷わず改善できます。
        </p>
      </Card>
      {sections.map((section) => (
        <div key={section} className="space-y-2">
          <p className="text-xs font-bold text-[var(--rose-dark)]">{section}</p>
          <div className="grid gap-2">
            {items
              .filter((item) => item.section === section)
              .map((item) => {
                const locked = item.requiresProfile && !profile;
                if (locked) {
                  return (
                    <div
                      key={item.href}
                      className="rounded-2xl bg-[var(--cream)]/60 px-4 py-3 opacity-80"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl grayscale">{item.icon}</span>
                        <p className="flex-1 text-sm font-bold text-[var(--muted)]">
                          {item.label}
                        </p>
                        <span className="text-[10px] font-bold text-[var(--rose-dark)]">
                          診断後
                        </span>
                      </div>
                      <p className="mt-1 pl-8 text-[11px] text-[var(--muted)]">{item.desc}</p>
                    </div>
                  );
                }
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-2xl bg-white px-4 py-3 ring-1 ring-[var(--rose-light)]/25"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{item.icon}</span>
                      <p className="flex-1 text-sm font-bold text-[var(--ink)]">{item.label}</p>
                      <span className="text-[var(--muted)]">→</span>
                    </div>
                    <p className="mt-1 pl-8 text-[11px] text-[var(--muted)]">{item.desc}</p>
                  </Link>
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );
}
