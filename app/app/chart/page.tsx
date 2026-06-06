"use client";

import Link from "next/link";
import { Card, SectionTitle, Tag } from "@/components/Card";
import { FaceInsightPanels } from "@/components/FaceInsightPanels";
import { PhotoGallery } from "@/components/PhotoGallery";
import { useProfile } from "@/components/ProfileProvider";
import { MAX_PHOTOS } from "@/lib/photos";

export default function ChartPage() {
  const { profile, photos, activePhoto, setActivePhoto, removePhoto } = useProfile();

  if (!profile) {
    return (
      <div className="space-y-4 text-center">
        <SectionTitle title="美容カルテ" />
        <Card>
          <p className="text-sm text-[var(--muted)]">診断結果がまだありません。</p>
          <Link
            href="/app/scan"
            className="mt-4 inline-block rounded-xl bg-[var(--ink)] px-6 py-3 text-sm font-bold text-white"
          >
            診断を始める
          </Link>
        </Card>
      </div>
    );
  }

  const rows = [
    { label: "顔タイプ", value: profile.faceType },
    { label: "動物顔", value: profile.animalFace },
    { label: "パーソナルカラー", value: profile.personalColor },
    { label: "骨格", value: profile.boneStructure },
  ];

  return (
    <div className="space-y-5">
      <SectionTitle
        sub="Beauty Chart"
        title="あなたの美容カルテ"
      />
      <p className="-mt-2 text-xs text-[var(--muted)]">
        診断日：{new Date(profile.analyzedAt).toLocaleDateString("ja-JP")}
      </p>

      {photos.length > 0 && (
        <Card>
          <PhotoGallery
            photos={photos}
            activeId={profile.activePhotoId ?? activePhoto?.id ?? null}
            onSelect={setActivePhoto}
            onRemove={removePhoto}
            maxPhotos={MAX_PHOTOS}
          />
          <Link
            href="/app/scan"
            className="mt-3 block text-center text-xs font-bold text-[var(--rose-dark)]"
          >
            写真を追加・再診断 →
          </Link>
        </Card>
      )}

      {activePhoto?.url && (
        <Card className="flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={activePhoto.url}
            alt=""
            className="h-24 w-24 rounded-2xl object-cover"
          />
          <div>
            <p className="font-display text-xl font-semibold">
              {profile.animalFace} × {profile.personalColor}
            </p>
            <p className="text-sm text-[var(--muted)]">{profile.boneStructure}</p>
            {photos.length > 1 && (
              <p className="mt-1 text-[10px] text-[var(--muted)]">
                選択中: {activePhoto.label}
              </p>
            )}
          </div>
        </Card>
      )}

      <Card>
        {rows.map((r) => (
          <div
            key={r.label}
            className="flex justify-between border-b border-[var(--cream)] py-3 last:border-0"
          >
            <span className="text-sm text-[var(--muted)]">{r.label}</span>
            <span className="text-sm font-bold">{r.value}</span>
          </div>
        ))}
      </Card>

      <Card>
        <p className="text-xs font-bold text-[var(--rose-dark)]">第一印象</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {profile.impressions.map((i) => (
            <Tag key={i}>{i}</Tag>
          ))}
        </div>
      </Card>

      <Card>
        <p className="text-xs font-bold text-[var(--rose-dark)]">似合う系統</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {profile.matchingStyles.map((s) => (
            <Tag key={s}>{s}</Tag>
          ))}
        </div>
      </Card>

      <Card>
        <p className="text-xs font-bold text-[var(--rose-dark)]">美容系統診断</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {profile.beautyStyles.map((s) => (
            <Tag key={s}>{s}</Tag>
          ))}
        </div>
      </Card>

      <FaceInsightPanels profile={profile} />

      <Card className="border border-[var(--rose-light)]/60 bg-[var(--cream)]/30">
        <p className="text-sm font-bold text-[var(--ink)]">診断結果から次へ</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <Link
            href={`/app/timeline?tab=feed&related=1&q=${encodeURIComponent(
              profile.faceType
            )}`}
            className="rounded-xl bg-white px-3 py-2 text-center text-xs font-bold ring-1 ring-[var(--rose-light)]/40"
          >
            顔タイプ関連投稿
          </Link>
          <Link
            href={`/app/timeline?tab=feed&related=1&q=${encodeURIComponent(
              profile.animalFace
            )}`}
            className="rounded-xl bg-white px-3 py-2 text-center text-xs font-bold ring-1 ring-[var(--rose-light)]/40"
          >
            動物顔関連投稿
          </Link>
          <Link
            href={`/app/timeline?tab=more&q=${encodeURIComponent("透明感")}`}
            className="rounded-xl bg-white px-3 py-2 text-center text-xs font-bold ring-1 ring-[var(--rose-light)]/40"
          >
            追加検索（透明感）
          </Link>
          <Link
            href="/app/simulate"
            className="rounded-xl bg-[var(--ink)] px-3 py-2 text-center text-xs font-bold text-white"
          >
            診断軸でシミュレーション
          </Link>
        </div>
      </Card>

      <Link
        href="/app/roadmap"
        className="block rounded-xl bg-[var(--ink)] py-3 text-center text-sm font-bold text-white"
      >
        垢抜けロードマップを見る
      </Link>
    </div>
  );
}
