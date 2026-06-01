"use client";

import { Card, SectionTitle } from "@/components/Card";
import { useProfile } from "@/components/ProfileProvider";
import { shareText } from "@/lib/diagnosis";

export default function SharePage() {
  const { profile } = useProfile();

  if (!profile) {
    return (
      <Card>
        <p className="text-sm text-[var(--muted)]">診断後にシェアできます。</p>
      </Card>
    );
  }

  const text = shareText(profile);
  const cardLine = `${profile.animalFace} × ${profile.personalColor} × ${profile.boneStructure}`;

  return (
    <div className="space-y-5">
      <SectionTitle sub="SNS" title="診断結果シェア" />

      <Card className="bg-gradient-to-br from-[var(--rose-light)]/30 to-[var(--cream)] text-center">
        <p className="font-display text-2xl font-semibold text-[var(--ink)]">{cardLine}</p>
        <p className="mt-2 text-sm text-[var(--muted)]">顔タイプ：{profile.faceType}</p>
        <p className="mt-4 text-xs text-[var(--rose-dark)]">#Beautily #美容診断</p>
      </Card>

      <Card>
        <p className="text-xs font-bold text-[var(--muted)]">シェア用テキスト</p>
        <pre className="mt-2 whitespace-pre-wrap text-sm">{text}</pre>
        <button
          type="button"
          className="mt-4 w-full rounded-xl bg-[var(--rose-dark)] py-3 text-sm font-bold text-white"
          onClick={() => {
            navigator.clipboard?.writeText(text);
            alert("コピーしました");
          }}
        >
          コピー
        </button>
      </Card>

      <Card>
        <p className="text-sm font-bold">似ている有名人</p>
        <p className="mt-2 text-sm text-[var(--muted)]">
          {profile.celebrities.join(" · ")}
        </p>
      </Card>
    </div>
  );
}
