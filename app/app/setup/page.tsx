"use client";

import { useRouter } from "next/navigation";
import { SectionTitle } from "@/components/Card";
import { BeautyPreferencesForm } from "@/components/BeautyPreferencesForm";

export default function SetupPage() {
  const router = useRouter();

  return (
    <div className="space-y-5">
      <SectionTitle
        sub="Profile"
        title="肌・悩み・予算を設定"
      />
      <p className="-mt-2 text-sm leading-relaxed text-[var(--muted)]">
        肌質（乾燥肌・脂性肌など）、赤み・くすみ、パーソナルカラー、悩み（しわ・ニキビ・しみ・美白）、年齢、予算を入力すると、スキンケア・メイク・服まで予算内でおすすめを提案します。
      </p>
      <BeautyPreferencesForm
        onSaved={() => router.push("/app/recommend")}
        submitLabel="この条件でおすすめを見る"
      />
    </div>
  );
}
