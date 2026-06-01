"use client";

import Link from "next/link";
import { Card, SectionTitle } from "@/components/Card";
import { useProfile } from "@/components/ProfileProvider";

export default function RoadmapPage() {
  const { profile } = useProfile();

  if (!profile) {
    return (
      <Card>
        <p className="text-sm text-[var(--muted)]">診断後にロードマップが表示されます。</p>
        <Link href="/app/scan" className="mt-2 inline-block text-sm font-bold text-[var(--rose-dark)]">
          診断へ
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <SectionTitle
        sub="Glow-up Plan"
        title="AI垢抜けロードマップ"
      />
      <p className="-mt-2 text-sm text-[var(--muted)]">
        診断結果から、最も効果の高い改善順を提案します。
      </p>

      <div className="space-y-3">
        {profile.roadmap.map((step) => (
          <Card key={step.step} className="relative pl-2">
            <div className="absolute left-0 top-4 bottom-4 w-1 rounded-full bg-[var(--rose-light)]" />
            <p className="text-xs font-bold text-[var(--rose-dark)]">STEP {step.step}</p>
            <p className="font-bold">{step.title}</p>
            <p className="mt-1 text-sm text-[var(--muted)]">{step.detail}</p>
          </Card>
        ))}
      </div>

      <Link
        href="/app/simulate"
        className="block rounded-xl bg-[var(--ink)] py-3 text-center text-sm font-bold text-white"
      >
        完成形をシミュレーション
      </Link>
    </div>
  );
}
