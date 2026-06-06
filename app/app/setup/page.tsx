"use client";

import { SectionTitle } from "@/components/Card";
import { BeautyPreferencesForm } from "@/components/BeautyPreferencesForm";

export default function SetupPage() {
  return (
    <div className="space-y-5">
      <SectionTitle sub="My Settings" title="マイ設定" />
      <p className="-mt-2 text-sm leading-relaxed text-[var(--muted)]">
        年齢・予算・肌質・悩み・パーソナルカラーを自分で設定して保存できます。保存した内容は、おすすめ商品・コスメ・服の提案に自動で使われます。
      </p>
      <BeautyPreferencesForm />
    </div>
  );
}
