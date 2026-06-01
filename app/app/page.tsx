"use client";

import Link from "next/link";
import { Card, SectionTitle } from "@/components/Card";
import { useProfile } from "@/components/ProfileProvider";
import { shareText } from "@/lib/diagnosis";

const quickLinks = [
  { href: "/app/timeline", label: "美容タイムライン", desc: "基礎4要素 → 診断後に深掘り", requiresProfile: false },
  { href: "/app/simulate", label: "シミュレーション", desc: "髪色・メイク・服を自分で確認", requiresProfile: true },
  { href: "/app/proposals", label: "美容提案", desc: "似合うメイク・髪・服", requiresProfile: true },
  { href: "/app/advisor", label: "美容秘書", desc: "24時間なんでも相談", requiresProfile: false },
  { href: "/app/shop", label: "買い物同行", desc: "商品が似合うか判定", requiresProfile: false },
  { href: "/app/roadmap", label: "垢抜けロードマップ", desc: "改善の優先順位", requiresProfile: true },
];

export default function AppHomePage() {
  const { profile } = useProfile();

  return (
    <div className="space-y-6">
      <section className="gradient-hero -mx-4 rounded-3xl px-5 py-8">
        <p className="text-xs font-bold uppercase tracking-widest text-[var(--rose-dark)]">
          Your Beauty Producer
        </p>
        <h1 className="font-display mt-2 text-3xl leading-tight text-[var(--ink)]">
          美容のことなら、
          <br />
          <span className="italic text-[var(--rose-dark)]">全部ここで完結。</span>
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
          顔写真1枚から、魅力・似合うもの・垢抜け方・買うべきものまで。
          診断で終わらず「一番似合う完成形」まで導きます。
        </p>
        <Link
          href="/app/scan"
          className="mt-6 inline-block rounded-full bg-[var(--ink)] px-6 py-3 text-sm font-bold text-white"
        >
          {profile ? "再診断する" : "顔写真で診断スタート"}
        </Link>
      </section>

      {profile ? (
        <Card>
          <SectionTitle sub="Latest" title="あなたの美容カルテ" />
          <div className="flex gap-4">
            {profile.photoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.photoUrl}
                alt=""
                className="h-20 w-20 rounded-2xl object-cover"
              />
            )}
            <div className="flex-1 text-sm">
              <p className="font-bold text-[var(--ink)]">
                {profile.animalFace} × {profile.personalColor} × {profile.boneStructure}
              </p>
              <p className="mt-1 text-[var(--muted)]">顔タイプ：{profile.faceType}</p>
              <Link href="/app/chart" className="mt-2 inline-block text-xs font-bold text-[var(--rose-dark)]">
                カルテを見る →
              </Link>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="border-dashed border-2 border-[var(--rose-light)] bg-[var(--cream)]/50">
          <p className="text-center text-sm text-[var(--muted)]">
            まだ診断がありません。
            <br />
            写真をアップロードして分析を開始しましょう。
          </p>
        </Card>
      )}

      <div>
        <SectionTitle sub="Features" title="あなた専属の機能" />
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
                className="card-hover rounded-2xl bg-white p-4 ring-1 ring-[var(--rose-light)]/25"
              >
                <p className="text-sm font-bold text-[var(--ink)]">{l.label}</p>
                <p className="mt-1 text-[11px] text-[var(--muted)]">{l.desc}</p>
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
