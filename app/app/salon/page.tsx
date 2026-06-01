"use client";

import { Card, SectionTitle, Tag } from "@/components/Card";
import { useProfile } from "@/components/ProfileProvider";

export default function SalonPage() {
  const { profile } = useProfile();

  if (!profile) {
    return (
      <Card>
        <p className="text-sm text-[var(--muted)]">診断後に美容師向け資料を作成できます。</p>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <SectionTitle title="美容院サポート" />
      <p className="-mt-2 text-sm text-[var(--muted)]">
        この画面を美容師に見せて、そのままオーダーできます。
      </p>

      <Card className="bg-[var(--cream)]">
        <p className="text-center text-xs font-bold text-[var(--rose-dark)]">Beautily オーダーシート</p>
        {profile.photoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.photoUrl}
            alt=""
            className="mx-auto mt-3 h-32 w-32 rounded-full object-cover"
          />
        )}
        <div className="mt-4 space-y-2 text-sm">
          <p>
            <b>おすすめ髪型：</b>
            {profile.hairStyle.join(" / ")}
          </p>
          <p>
            <b>おすすめ髪色：</b>
            {profile.hairColor.join(" / ")}
          </p>
          <p>
            <b>顔タイプ：</b>
            {profile.faceType} · {profile.animalFace}
          </p>
          <p>
            <b>パーソナルカラー：</b>
            {profile.personalColor}
          </p>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {profile.hairStyle.map((h) => (
            <Tag key={h}>{h}</Tag>
          ))}
        </div>
        <p className="mt-4 text-xs text-[var(--muted)]">
          参考：{profile.glowUpTips[0]?.advice}
        </p>
      </Card>

      <button
        type="button"
        className="w-full rounded-xl border border-[var(--rose-light)] py-3 text-sm font-bold"
        onClick={() => window.print()}
      >
        印刷 / PDF保存
      </button>
    </div>
  );
}
