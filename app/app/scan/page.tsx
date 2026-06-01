"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Card, ScoreBar, SectionTitle, Tag } from "@/components/Card";
import { FaceInsightPanels } from "@/components/FaceInsightPanels";
import { PhotoGallery } from "@/components/PhotoGallery";
import { useProfile } from "@/components/ProfileProvider";
import { analyzePhoto } from "@/lib/diagnosis";
import { compressPhotoDataUrl } from "@/lib/imageCompress";
import {
  addPhotoToProfile,
  ensurePhotosArray,
  getActivePhotoUrl,
  MAX_PHOTOS,
} from "@/lib/photos";
import type { BeautyProfile } from "@/lib/types";

type Phase = "idle" | "preparing" | "analyzing" | "adding" | "done" | "error";

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("写真の読み込みに失敗しました"));
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("写真の読み込みに失敗しました"));
    };
    reader.readAsDataURL(file);
  });
}

export default function ScanPage() {
  const { profile, setProfile, photos, activePhoto, setActivePhoto, removePhoto } =
    useProfile();
  const inputRef = useRef<HTMLInputElement>(null);
  const addInputRef = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [result, setResult] = useState(profile);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    activePhoto?.url ?? profile?.photoUrl ?? null
  );

  useEffect(() => {
    if (activePhoto?.url) setPreviewUrl(activePhoto.url);
  }, [activePhoto?.url]);

  useEffect(() => {
    if (profile && !result) {
      setResult(profile);
      setPhase("done");
    }
  }, [profile, result]);

  const mergeDiagnosis = (
    existing: BeautyProfile | null,
    diagnosis: BeautyProfile,
    photoUrl: string,
    photoId?: string
  ): BeautyProfile => {
    const id = existing?.id ?? diagnosis.id;
    let next = existing ? ensurePhotosArray(existing) : null;

    if (next && photoId) {
      const updatedPhotos = (next.photos ?? []).map((p) =>
        p.id === photoId
          ? { ...p, url: photoUrl, analyzedAt: diagnosis.analyzedAt }
          : p
      );
      return {
        ...diagnosis,
        id,
        photos: updatedPhotos,
        activePhotoId: photoId,
        photoUrl,
      };
    }

    if (next) {
      const added = addPhotoToProfile(next, photoUrl, {
        setActive: true,
        analyzedAt: diagnosis.analyzedAt,
      });
      return { ...diagnosis, id, photos: added.photos, activePhotoId: added.activePhotoId, photoUrl };
    }

    const created = addPhotoToProfile(diagnosis, photoUrl, {
      label: "写真 1",
      setActive: true,
      analyzedAt: diagnosis.analyzedAt,
    });
    return { ...diagnosis, photos: created.photos, activePhotoId: created.activePhotoId, photoUrl };
  };

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

      const diagnosis = analyzePhoto(compressed);
      const photoId = activePhoto?.id;
      const merged = mergeDiagnosis(profile, diagnosis, compressed, photoId);
      setProgress(100);

      setProfile(merged);
      setResult(merged);
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

  const addPhotosOnly = async (files: File[]) => {
    setErrorMsg("");
    setPhase("adding");
    setProgress(10);

    try {
      let current = profile ? ensurePhotosArray(profile) : null;
      const imageFiles = files.filter((f) => f.type.startsWith("image/"));
      if (!imageFiles.length) {
        setPhase("error");
        setErrorMsg("画像ファイルを選んでください。");
        return;
      }

      const remaining = MAX_PHOTOS - (current?.photos?.length ?? 0);
      if (remaining <= 0) {
        setPhase("error");
        setErrorMsg(`写真は最大${MAX_PHOTOS}枚までです。`);
        return;
      }

      const toAdd = imageFiles.slice(0, remaining);
      let done = 0;

      for (const file of toAdd) {
        const raw = await readFileAsDataUrl(file);
        const compressed = await compressPhotoDataUrl(raw);
        done += 1;
        setProgress(Math.round((done / toAdd.length) * 100));

        if (!current) {
          const diagnosis = analyzePhoto(compressed);
          current = addPhotoToProfile(diagnosis, compressed, {
            label: `写真 ${done}`,
            setActive: done === 1,
            analyzedAt: diagnosis.analyzedAt,
          });
          current = { ...diagnosis, ...current, id: diagnosis.id };
        } else {
          current = addPhotoToProfile(current, compressed, {
            label: `写真 ${(current.photos?.length ?? 0) + 1}`,
            setActive: false,
          });
        }
      }

      setProfile(current);
      setResult(current);
      setPreviewUrl(getActivePhotoUrl(current));
      setPhase("done");
    } catch (e) {
      setPhase("error");
      setErrorMsg(
        e instanceof Error ? e.message : "写真の追加に失敗しました。"
      );
    } finally {
      setProgress(0);
    }
  };

  const onAnalyzeFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (inputRef.current) inputRef.current.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setPhase("error");
      setErrorMsg("画像ファイルを選んでください。");
      return;
    }
    void readFileAsDataUrl(file).then(runAnalysis);
  };

  const onAddFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files;
    if (addInputRef.current) addInputRef.current.value = "";
    if (!list?.length) return;
    void addPhotosOnly(Array.from(list));
  };

  const loading = phase === "preparing" || phase === "analyzing" || phase === "adding";
  const galleryPhotos = photos.length > 0 ? photos : [];

  return (
    <div className="space-y-6">
      <SectionTitle sub="Analysis" title="顔写真から自動分析" />
      <p className="-mt-2 text-sm text-[var(--muted)]">
        複数枚の写真を登録でき、選んだ写真で診断・シミュレーションができます。
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onAnalyzeFile}
      />
      <input
        ref={addInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={onAddFiles}
      />

      {galleryPhotos.length > 0 && (
        <Card>
          <PhotoGallery
            photos={galleryPhotos}
            activeId={profile?.activePhotoId ?? activePhoto?.id ?? null}
            onSelect={(id) => {
              setActivePhoto(id);
              const ph = galleryPhotos.find((p) => p.id === id);
              if (ph) setPreviewUrl(ph.url);
            }}
            onAdd={() => addInputRef.current?.click()}
            onRemove={removePhoto}
            maxPhotos={MAX_PHOTOS}
          />
        </Card>
      )}

      <Card>
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt="選択中の写真"
            className="mx-auto mb-4 aspect-square max-h-56 w-full rounded-2xl object-cover"
          />
        ) : (
          <div
            className="mb-4 flex aspect-square max-h-56 w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[var(--rose-light)] bg-[var(--cream)]"
            onClick={() => !loading && addInputRef.current?.click()}
            onKeyDown={(e) => e.key === "Enter" && !loading && addInputRef.current?.click()}
            role="button"
            tabIndex={0}
          >
            <span className="text-4xl">📷</span>
            <p className="mt-2 text-sm font-semibold text-[var(--rose-dark)]">
              タップして写真を追加
            </p>
            <p className="mt-1 text-[10px] text-[var(--muted)]">複数枚まとめて選択OK</p>
          </div>
        )}

        <div className="grid gap-2">
          <button
            type="button"
            disabled={loading}
            onClick={() => addInputRef.current?.click()}
            className="w-full rounded-xl border border-[var(--rose-light)] py-3 text-sm font-bold text-[var(--ink)] disabled:opacity-50"
          >
            {loading && phase === "adding" ? "追加中…" : "写真を追加（複数可）"}
          </button>
          <button
            type="button"
            disabled={loading || !previewUrl}
            onClick={() => inputRef.current?.click()}
            className="w-full rounded-xl bg-[var(--ink)] py-3 text-sm font-bold text-white disabled:opacity-50"
          >
            {loading && phase !== "adding"
              ? phase === "preparing"
                ? "写真を準備中…"
                : "分析中…"
              : "選択中の写真で診断"}
          </button>
        </div>
      </Card>

      {loading && (
        <Card className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-[var(--rose-light)] border-t-[var(--rose-dark)]" />
          <p className="mt-3 text-sm font-semibold">
            {phase === "adding"
              ? "写真を追加しています"
              : phase === "preparing"
                ? "写真を最適化しています"
                : "顔を分析しています"}
          </p>
          {progress > 0 && (
            <>
              <div className="mx-auto mt-3 h-2 max-w-xs overflow-hidden rounded-full bg-[var(--cream)]">
                <div
                  className="h-full rounded-full bg-[var(--rose-dark)] transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-[var(--muted)]">{progress}%</p>
            </>
          )}
        </Card>
      )}

      {phase === "error" && errorMsg && (
        <Card className="border border-rose-200 bg-rose-50/80">
          <p className="text-sm font-semibold text-rose-800">{errorMsg}</p>
        </Card>
      )}

      {result && phase === "done" && !loading && (
        <>
          <Card className="border border-[var(--rose-light)]/50 bg-[var(--cream)]/40">
            <p className="text-center text-sm font-bold text-[var(--rose-dark)]">
              {galleryPhotos.length > 1
                ? `${galleryPhotos.length}枚の写真を登録中`
                : "分析が完了しました"}
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

          <FaceInsightPanels profile={result} />

          <div className="flex flex-col gap-2">
            <Link
              href="/app/discover"
              className="rounded-xl bg-[var(--rose-dark)] py-3 text-center text-sm font-bold text-white"
            >
              3つの「新しい私」を見る →
            </Link>
            <div className="flex gap-3">
              <Link
                href="/app/simulate"
                className="flex-1 rounded-xl bg-[var(--ink)] py-3 text-center text-sm font-bold text-white"
              >
                シミュレーション
              </Link>
              <Link
                href="/app/chart"
                className="flex-1 rounded-xl border border-[var(--rose-light)] py-3 text-center text-sm font-bold"
              >
                カルテ
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
