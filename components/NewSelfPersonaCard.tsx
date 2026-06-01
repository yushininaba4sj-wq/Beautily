"use client";

import Link from "next/link";
import type { NewSelfPersona } from "@/lib/newSelf";

export function NewSelfPersonaCard({ persona }: { persona: NewSelfPersona }) {
  return (
    <div className="shine-card overflow-hidden rounded-2xl bg-white ring-1 ring-[var(--rose-light)]/35">
      <div className="bg-gradient-to-br from-[var(--rose-light)]/40 to-[var(--cream)] px-4 py-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="text-2xl">{persona.emoji}</span>
            <h3 className="font-display mt-1 text-xl font-semibold text-[var(--ink)]">
              {persona.title}
            </h3>
            <p className="text-xs font-bold text-[var(--rose-dark)]">{persona.tagline}</p>
          </div>
        </div>
      </div>
      <div className="space-y-3 p-4">
        <p className="text-sm leading-relaxed text-[var(--muted)]">{persona.oneLiner}</p>
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="rounded-lg bg-[var(--cream)] px-2.5 py-2">
            <p className="text-[var(--muted)]">髪色</p>
            <p className="font-bold">{persona.hairColor}</p>
          </div>
          <div className="rounded-lg bg-[var(--cream)] px-2.5 py-2">
            <p className="text-[var(--muted)]">髪型</p>
            <p className="font-bold">{persona.hairStyle}</p>
          </div>
          <div className="rounded-lg bg-[var(--cream)] px-2.5 py-2">
            <p className="text-[var(--muted)]">メイク</p>
            <p className="font-bold">{persona.makeup}</p>
          </div>
          <div className="rounded-lg bg-[var(--cream)] px-2.5 py-2">
            <p className="text-[var(--muted)]">ファッション</p>
            <p className="font-bold">{persona.fashion}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {persona.vibeWords.map((w) => (
            <span
              key={w}
              className="rounded-full bg-[var(--rose-light)]/35 px-2 py-0.5 text-[10px] font-semibold text-[var(--rose-dark)]"
            >
              {w}
            </span>
          ))}
        </div>
        <Link
          href="/app/simulate"
          className="block rounded-xl bg-[var(--ink)] py-2.5 text-center text-xs font-bold text-white"
        >
          この私をシミュレーションで見る →
        </Link>
      </div>
    </div>
  );
}
