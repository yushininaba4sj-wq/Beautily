"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Card, ScoreBar, SectionTitle, Tag } from "@/components/Card";
import { useProfile } from "@/components/ProfileProvider";
import { analyzePhoto } from "@/lib/diagnosis";

export default function ScanPage() {
  const { profile, setProfile } = useProfile();
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(profile);

  const runAnalysis = (dataUrl: string) => {
    setLoading(true);
    setTimeout(() => {
      const p = analyzePhoto(dataUrl);
      setProfile(p);
      setResult(p);
      setLoading(false);
    }, 2200);
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") runAnalysis(reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      <SectionTitle
        sub="AI Analysis"
        title="顔写真から自動分析"
      />
      <p className="-mt-2 text-sm text-[var(--muted)]">
        パーソナルカラー・骨格・顔タイプ・動物顔・垢抜けポイントまで一括診断。
      </p>

      <Card>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="user"
          className="hidden"
          onChange={onFile}
        />
        {result?.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={result.photoUrl}
            alt="診断写真"
            className="mx-auto mb-4 aspect-square max-h-56 w-full rounded-2xl object-cover"
          />
        ) : (
          <div
            className="mb-4 flex aspect-square max-h-56 w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[var(--rose-light)] bg-[var(--cream)]"
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
            role="button"
            tabIndex={0}
          >
            <span className="text-4xl">📷</span>
            <p className="mt-2 text-sm font-semibold text-[var(--rose-dark)]">
              タップして顔写真を選択
            </p>
          </div>
        )}
        <button
          type="button"
          disabled={loading}
          onClick={() => inputRef.current?.click()}
          className="w-full rounded-xl bg-[var(--ink)] py-3 text-sm font-bold text-white disabled:opacity-50"
        >
          {loading ? "AI分析中…" : result ? "別の写真で再診断" : "写真を選ぶ"}
        </button>
      </Card>

      {loading && (
        <Card className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-[var(--rose-light)] border-t-[var(--rose-dark)]" />
          <p className="mt-3 text-sm font-semibold">AIが顔を分析しています</p>
          <p className="text-xs text-[var(--muted)]">パーソナルカラー・骨格・魅力…</p>
        </Card>
      )}

      {result && !loading && (
        <>
          <Card>
            <SectionTitle title="診断サマリー" />
            <div className="flex flex-wrap gap-2">
              <Tag>{result.personalColor}</Tag>
              <Tag>{result.boneStructure}</Tag>
              <Tag>{result.faceType}</Tag>
              <Tag>{result.animalFace}</Tag>
            </div>
            <p className="mt-3 text-sm text-[var(--muted)]">
              第一印象：{result.impressions.join(" · ")}
            </p>
            <p className="text-sm text-[var(--muted)]">
              似合う系統：{result.matchingStyles.join(" · ")}
            </p>
          </Card>

          <Card>
            <SectionTitle title="顔の魅力スコア" />
            <div className="space-y-3">
              <ScoreBar label="目力" value={result.charm.eyePower} />
              <ScoreBar label="輪郭" value={result.charm.contour} />
              <ScoreBar label="横顔" value={result.charm.profile} />
              <ScoreBar label="鼻筋" value={result.charm.noseLine} />
              <ScoreBar label="透明感" value={result.charm.clarity} />
              <ScoreBar label="バランス" value={result.charm.balance} />
            </div>
          </Card>

          <Card>
            <SectionTitle title="垢抜け優先ポイント" />
            <ol className="space-y-3">
              {result.glowUpTips.map((t) => (
                <li key={t.area} className="flex gap-3 text-sm">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--rose-dark)] text-xs font-bold text-white">
                    {t.priority}
                  </span>
                  <div>
                    <p className="font-bold">{t.area}</p>
                    <p className="text-[var(--muted)]">{t.advice}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Card>

          <Card>
            <SectionTitle title="似ている有名人" />
            <div className="flex flex-wrap gap-2">
              {result.celebrities.map((c) => (
                <Tag key={c}>{c}</Tag>
              ))}
            </div>
          </Card>

          <div className="flex gap-3">
            <Link
              href="/app/chart"
              className="flex-1 rounded-xl bg-[var(--rose-dark)] py-3 text-center text-sm font-bold text-white"
            >
              美容カルテへ
            </Link>
            <Link
              href="/app/proposals"
              className="flex-1 rounded-xl border border-[var(--rose-light)] py-3 text-center text-sm font-bold"
            >
              提案を見る
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
