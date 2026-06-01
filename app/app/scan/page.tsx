"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Card, ScoreBar, SectionTitle, Tag } from "@/components/Card";
import { useProfile } from "@/components/ProfileProvider";
import { analyzePhoto } from "@/lib/diagnosis";
import { compressPhotoDataUrl } from "@/lib/imageCompress";

type Phase = "idle" | "preparing" | "analyzing" | "done" | "error";

export default function ScanPage() {
  const { profile, setProfile } = useProfile();
  const inputRef = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [result, setResult] = useState(profile);
  const [previewUrl, setPreviewUrl] = useState<string | null>(profile?.photoUrl ?? null);

  useEffect(() => {
    if (profile && !result) {
      setResult(profile);
      setPreviewUrl(profile.photoUrl);
      setPhase("done");
    }
  }, [profile, result]);

  const runAnalysis = async (rawDataUrl: string) => {
    setErrorMsg("");
    setPhase("preparing");
    setProgress(15);
    setPreviewUrl(rawDataUrl);

    try {
      const compressed = await compressPhotoDataUrl(rawDataUrl);
      setProgress(45);
      setPhase("analyzing");
      setPreviewUrl(compressed);

      await new Promise((r) => setTimeout(r, 600));
      setProgress(75);

      const p = analyzePhoto(compressed);
      setProgress(100);

      setProfile(p);
      setResult(p);
      setPhase("done");
    } catch (e) {
      console.error("Beautily scan:", e);
      setPhase("error");
      setErrorMsg(
        e instanceof Error
          ? e.message
          : "分析できませんでした。別の写真をお試しください。"
      );
      setProgress(0);
    }
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (inputRef.current) inputRef.current.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setPhase("error");
      setErrorMsg("画像ファイルを選んでください。");
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => {
      setPhase("error");
      setErrorMsg("写真の読み込みに失敗しました。");
    };
    reader.onload = () => {
      if (typeof reader.result === "string") {
        void runAnalysis(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const loading = phase === "preparing" || phase === "analyzing";

  return (
    <div className="space-y-6">
      <SectionTitle sub="Analysis" title="顔写真から自動分析" />
      <p className="-mt-2 text-sm text-[var(--muted)]">
        パーソナルカラー・骨格・顔タイプ・動物顔・垢抜けポイントまで一括診断。
      </p>

      <Card>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onFile}
        />
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt="診断写真"
            className="mx-auto mb-4 aspect-square max-h-56 w-full rounded-2xl object-cover"
          />
        ) : (
          <div
            className="mb-4 flex aspect-square max-h-56 w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[var(--rose-light)] bg-[var(--cream)]"
            onClick={() => !loading && inputRef.current?.click()}
            onKeyDown={(e) => e.key === "Enter" && !loading && inputRef.current?.click()}
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
          {loading
            ? phase === "preparing"
              ? "写真を準備中…"
              : "分析中…"
            : result
              ? "別の写真で再診断"
              : "写真を選ぶ"}
        </button>
      </Card>

      {loading && (
        <Card className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-[var(--rose-light)] border-t-[var(--rose-dark)]" />
          <p className="mt-3 text-sm font-semibold">
            {phase === "preparing" ? "写真を最適化しています" : "顔を分析しています"}
          </p>
          <div className="mx-auto mt-3 h-2 max-w-xs overflow-hidden rounded-full bg-[var(--cream)]">
            <div
              className="h-full rounded-full bg-[var(--rose-dark)] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-[var(--muted)]">{progress}%</p>
        </Card>
      )}

      {phase === "error" && errorMsg && (
        <Card className="border border-rose-200 bg-rose-50/80">
          <p className="text-sm font-semibold text-rose-800">{errorMsg}</p>
          <button
            type="button"
            className="mt-3 text-sm font-bold text-[var(--rose-dark)]"
            onClick={() => {
              setPhase("idle");
              setErrorMsg("");
              inputRef.current?.click();
            }}
          >
            もう一度選ぶ
          </button>
        </Card>
      )}

      {result && phase === "done" && !loading && (
        <>
          <Card className="border border-[var(--rose-light)]/50 bg-[var(--cream)]/40">
            <p className="text-center text-sm font-bold text-[var(--rose-dark)]">
              分析が完了しました
            </p>
          </Card>

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
              href="/app/timeline"
              className="flex-1 rounded-xl bg-[var(--rose-dark)] py-3 text-center text-sm font-bold text-white"
            >
              タイムラインへ
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
