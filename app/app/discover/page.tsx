"use client";

import Link from "next/link";
import { Card, SectionTitle } from "@/components/Card";
import { NewSelfPersonaCard } from "@/components/NewSelfPersonaCard";
import { TransformationJourney } from "@/components/TransformationJourney";
import { useProfile } from "@/components/ProfileProvider";
import {
  getGlowPotential,
  getNewSelfPersonas,
  getTransformationJourney,
  getVisionMessage,
} from "@/lib/newSelf";

export default function DiscoverPage() {
  const { profile, activePhotoUrl } = useProfile();
  const journey = getTransformationJourney(profile);
  const vision = getVisionMessage(profile);

  if (!profile) {
    return (
      <div className="space-y-6">
        <section className="gradient-premium -mx-4 rounded-3xl px-5 py-10 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--gold)]">
            New You
          </p>
          <h1 className="font-display mt-2 text-3xl leading-tight text-[var(--ink)]">
            まだ出会っていない
            <br />
            <span className="italic text-[var(--rose-dark)]">「新しい私」</span>
            へ
          </h1>
          <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-[var(--muted)]">
            {vision}
          </p>
          <Link
            href="/app/scan"
            className="mt-8 inline-block rounded-full bg-[var(--ink)] px-8 py-3.5 text-sm font-bold text-white shadow-lg"
          >
            診断して可能性を解放
          </Link>
        </section>
        <Card>
          <TransformationJourney steps={journey} />
        </Card>
      </div>
    );
  }

  const personas = getNewSelfPersonas(profile);
  const glow = getGlowPotential(profile);

  return (
    <div className="space-y-6">
      <section className="gradient-premium -mx-4 rounded-3xl px-5 py-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--gold)]">
          Discover Your New Self
        </p>
        <h1 className="font-display mt-2 text-3xl leading-tight text-[var(--ink)]">
          新しい私を
          <br />
          <span className="italic text-[var(--rose-dark)]">探しにいこう</span>
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">{vision}</p>
        {activePhotoUrl && (
          <div className="mt-5 flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activePhotoUrl}
              alt=""
              className="h-28 w-28 rounded-full object-cover ring-4 ring-white/80 shadow-lg"
            />
          </div>
        )}
      </section>

      <Card className="border border-[var(--rose-light)]/50 bg-gradient-to-br from-white to-[var(--cream)]/80">
        <p className="text-xs font-bold text-[var(--rose-dark)]">あなたの伸びしろ</p>
        <div className="mt-2 flex items-end gap-2">
          <p className="font-display text-5xl font-semibold leading-none text-[var(--ink)]">
            +{glow.percent}
          </p>
          <p className="pb-1 text-sm font-bold text-[var(--muted)]">% まで近づける</p>
        </div>
        <p className="mt-1 text-xs font-bold text-[var(--gold)]">{glow.label}</p>
        <p className="mt-2 text-sm text-[var(--muted)]">{glow.message}</p>
      </Card>

      <Card>
        <TransformationJourney steps={journey} />
      </Card>

      <div>
        <SectionTitle
          sub="3 Possibilities"
          title="あなたの3つの可能性"
        />
        <p className="-mt-2 mb-4 text-sm text-[var(--muted)]">
          診断から導き出した、別バージョンの自分。気になるものをタップしてプレビュー。
        </p>
        <div className="space-y-4">
          {personas.map((p) => (
            <NewSelfPersonaCard key={p.id} persona={p} />
          ))}
        </div>
      </div>

      <Card className="bg-[var(--ink)] text-white">
        <p className="text-center text-sm font-bold">今日の一歩</p>
        <p className="mt-2 text-center text-xs leading-relaxed opacity-90">
          {profile.glowUpTips[0]?.advice}
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Link
            href="/app/simulate"
            className="rounded-xl bg-white py-3 text-center text-xs font-bold text-[var(--ink)]"
          >
            変化を試す
          </Link>
          <Link
            href="/app/roadmap"
            className="rounded-xl border border-white/30 py-3 text-center text-xs font-bold"
          >
            ロードマップ
          </Link>
        </div>
      </Card>
    </div>
  );
}
