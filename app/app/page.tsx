"use client";

import Link from "next/link";
import { Card, SectionTitle } from "@/components/Card";
import { SavedPreferencesSummary } from "@/components/BeautyPreferencesForm";
import { TransformationJourney } from "@/components/TransformationJourney";
import { useProfile } from "@/components/ProfileProvider";
import { shareText } from "@/lib/diagnosis";
import { getGlowPotential, getTransformationJourney, getVisionMessage } from "@/lib/newSelf";

const quickLinks = [
  { href: "/app/setup", label: "マイ設定", desc: "予算・肌・悩みを保存", requiresProfile: false, highlight: true },
  { href: "/app/recommend", label: "おすすめ商品", desc: "保存した設定で提案", requiresProfile: false, highlight: true },
  { href: "/app/discover", label: "新しい私を探す", desc: "3つの可能性・伸びしろ", requiresProfile: true, highlight: false },
  { href: "/app/simulate", label: "シミュレーション", desc: "髪・メイク・服を大胆に試す", requiresProfile: true },
  { href: "/app/timeline", label: "美容タイムライン", desc: "基礎から学ぶ・深掘り", requiresProfile: false },
  { href: "/app/proposals", label: "美容提案", desc: "似合うコーデ一式", requiresProfile: true },
  { href: "/app/advisor", label: "美容秘書", desc: "24時間なんでも相談", requiresProfile: false },
  { href: "/app/roadmap", label: "垢抜けロードマップ", desc: "完成形までの順番", requiresProfile: true },
];

export default function AppHomePage() {
  const { profile } = useProfile();
  const journey = getTransformationJourney(profile);
  const vision = getVisionMessage(profile);
  const glow = profile ? getGlowPotential(profile) : null;

  return (
    <div className="space-y-6">
      <section className="gradient-premium -mx-4 rounded-3xl px-5 py-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--gold)]">
          Beautily
        </p>
        <h1 className="font-display mt-2 text-3xl leading-tight text-[var(--ink)]">
          {profile ? (
            <>
              まだ知らない
              <br />
              <span className="text-shimmer">「新しい私」</span>へ
            </>
          ) : (
            <>
              美容アプリの
              <br />
              <span className="italic text-[var(--rose-dark)]">その先へ。</span>
            </>
          )}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">{vision}</p>
        <Link
          href={profile ? "/app/discover" : "/app/scan"}
          className="mt-6 inline-block rounded-full bg-[var(--ink)] px-6 py-3 text-sm font-bold text-white shadow-md"
        >
          {profile ? "新しい私を探す →" : "無料で診断スタート"}
        </Link>
      </section>

      <SavedPreferencesSummary />

      {profile && glow && (
        <Link href="/app/discover" className="block">
          <Card className="card-hover border border-[var(--rose-light)]/60 bg-gradient-to-r from-white to-[var(--cream)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-[var(--rose-dark)]">あなたの可能性</p>
                <p className="font-display mt-1 text-2xl font-semibold">
                  あと <span className="text-[var(--rose-dark)]">+{glow.percent}%</span> 垢抜け
                </p>
                <p className="mt-1 text-[11px] text-[var(--muted)]">{glow.label}</p>
              </div>
              <span className="text-2xl">→</span>
            </div>
          </Card>
        </Link>
      )}

      <Card>
        <TransformationJourney steps={journey} />
      </Card>

      {profile ? (
        <Card>
          <SectionTitle sub="You" title="いまのあなた" />
          <div className="flex gap-4">
            {profile.photoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.photoUrl}
                alt=""
                className="h-20 w-20 rounded-2xl object-cover ring-2 ring-[var(--rose-light)]"
              />
            )}
            <div className="flex-1 text-sm">
              <p className="font-bold text-[var(--ink)]">
                {profile.animalFace} × {profile.personalColor}
              </p>
              <p className="mt-1 text-[var(--muted)]">{profile.faceType} · {profile.boneStructure}</p>
              <Link href="/app/chart" className="mt-2 inline-block text-xs font-bold text-[var(--rose-dark)]">
                カルテを見る →
              </Link>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="border-dashed border-2 border-[var(--rose-light)] bg-[var(--cream)]/50">
          <p className="text-center text-sm text-[var(--muted)]">
            診断すると「3つの新しい私」とシミュレーションが解放されます。
          </p>
        </Card>
      )}

      <div>
        <SectionTitle sub="Tools" title="変身のツールボックス" />
        <div className="grid grid-cols-2 gap-3">
          {quickLinks.map((l) => {
            const locked = l.requiresProfile && !profile;
            if (locked) {
              return (
                <div
                  key={l.href}
                  className="rounded-2xl bg-[var(--cream)]/80 p-4 ring-1 ring-[var(--rose-light)]/20"
                >
                  <p className="text-sm font-bold text-[var(--muted)]">{l.label}</p>
                  <p className="mt-1 text-[11px] text-[var(--muted)]">{l.desc}</p>
                  <p className="mt-2 text-[10px] font-bold text-[var(--rose-dark)]">診断後に解放</p>
                </div>
              );
            }
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`card-hover rounded-2xl p-4 ring-1 ${
                  l.highlight
                    ? "bg-gradient-to-br from-[var(--rose-dark)] to-[var(--rose)] text-white ring-transparent"
                    : "bg-white ring-[var(--rose-light)]/25"
                }`}
              >
                <p className={`text-sm font-bold ${l.highlight ? "text-white" : "text-[var(--ink)]"}`}>
                  {l.label}
                </p>
                <p className={`mt-1 text-[11px] ${l.highlight ? "text-white/85" : "text-[var(--muted)]"}`}>
                  {l.desc}
                </p>
              </Link>
            );
          })}
        </div>
      </div>

      {profile && (
        <Card>
          <p className="text-xs font-bold text-[var(--muted)]">シェア用テキスト</p>
          <p className="mt-2 whitespace-pre-wrap text-sm">{shareText(profile)}</p>
          <button
            type="button"
            className="mt-3 w-full rounded-xl bg-[var(--rose-dark)] py-2.5 text-xs font-bold text-white"
            onClick={() => navigator.clipboard?.writeText(shareText(profile))}
          >
            コピーしてSNSにシェア
          </button>
        </Card>
      )}
    </div>
  );
}
