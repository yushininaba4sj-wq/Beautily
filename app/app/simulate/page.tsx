"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Card, SectionTitle } from "@/components/Card";
import { PhotoGallery } from "@/components/PhotoGallery";
import { useProfile } from "@/components/ProfileProvider";
import { compressPhotoDataUrl } from "@/lib/imageCompress";
import { MAX_PHOTOS } from "@/lib/photos";
import {
  buildFinishPreset,
  HAIR_COLOR_PRESETS,
  HAIR_STYLE_PRESETS,
  MAKEUP_PRESETS,
  presetsForCategory,
  type LookCategory,
  type LookPreset,
} from "@/lib/lookPresets";
import {
  buildPresetFromReference,
  loadCustomPresets,
  saveCustomPreset,
  type SavedCustomPreset,
} from "@/lib/referenceStyle";
import { renderLookPreview } from "@/lib/lookRenderer";

type SimTab = LookCategory;

const tabs: { id: SimTab; label: string; hint: string }[] = [
  { id: "hairColor", label: "髪色", hint: "髪だけ色変更" },
  { id: "hairStyle", label: "髪型", hint: "前髪・長さの印象" },
  { id: "makeup", label: "メイク", hint: "リップ・チーク・目元" },
  { id: "fashion", label: "ファッション", hint: "服の色・系統" },
  { id: "finish", label: "完成形", hint: "全部まとめて" },
];

const tabRefLabel: Record<SimTab, string> = {
  hairColor: "髪色の参考画像",
  hairStyle: "髪型の参考画像",
  makeup: "メイクの参考画像",
  fashion: "服・コーデの参考画像",
  finish: "なりたい雰囲気の参考画像",
};

function cacheKey(photoId: string, presetId: string) {
  return `${photoId}:${presetId}`;
}

export default function SimulatePage() {
  const {
    profile,
    activePhotoUrl,
    photos,
    activePhoto,
    setActivePhoto,
    removePhoto,
  } = useProfile();
  const [tab, setTab] = useState<SimTab>("hairColor");
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [cache, setCache] = useState<Record<string, string>>({});
  const cacheRef = useRef(cache);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customPresets, setCustomPresets] = useState<SavedCustomPreset[]>([]);
  const refInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    cacheRef.current = cache;
  }, [cache]);

  useEffect(() => {
    setCustomPresets(loadCustomPresets());
  }, []);

  const basePresets = useMemo(() => {
    if (tab === "finish" && profile) {
      return [
        buildFinishPreset(
          profile.hairColor[0] || "ミルクティー",
          "韓流きれいめ",
          profile.fashion[0] || "韓国きれいめ"
        ),
      ];
    }
    const base = presetsForCategory(tab);
    if (!profile) return base;
    if (tab === "hairColor") {
      const mine = profile.hairColor
        .map((n) => HAIR_COLOR_PRESETS.find((p) => p.name === n))
        .filter(Boolean) as LookPreset[];
      const rest = base.filter((p) => !mine.some((m) => m.id === p.id));
      return [...mine, ...rest];
    }
    if (tab === "hairStyle") {
      const mine = profile.hairStyle
        .map((n) => HAIR_STYLE_PRESETS.find((p) => p.name === n))
        .filter(Boolean) as LookPreset[];
      const rest = base.filter((p) => !mine.some((m) => m.id === p.id));
      return [...mine, ...rest];
    }
    return base;
  }, [tab, profile]);

  const tabCustoms = useMemo(
    () => customPresets.filter((p) => p.category === tab),
    [customPresets, tab]
  );

  const presets = useMemo(() => [...tabCustoms, ...basePresets], [tabCustoms, basePresets]);

  const picked = presets.find((p) => p.id === pickedId) || null;
  const photoId = activePhoto?.id ?? "default";
  const activeTab = tabs.find((t) => t.id === tab);

  useEffect(() => {
    setCache({});
    cacheRef.current = {};
    setPreviewUrl(null);
    setPickedId(null);
    setError(null);
  }, [photoId]);

  const generateOne = useCallback(
    async (preset: LookPreset) => {
      if (!activePhotoUrl) return;
      const key = cacheKey(photoId, preset.id);

      const cached = cacheRef.current[key];
      if (cached) {
        setPreviewUrl(cached);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);
      setPreviewUrl(null);

      try {
        const imageUrl = await renderLookPreview(activePhotoUrl, preset);
        setCache((c) => ({ ...c, [key]: imageUrl }));
        cacheRef.current = { ...cacheRef.current, [key]: imageUrl };
        setPreviewUrl(imageUrl);
      } catch (e) {
        setError(e instanceof Error ? e.message : "画像を生成できませんでした");
      } finally {
        setLoading(false);
      }
    },
    [activePhotoUrl, photoId]
  );

  const onPick = (preset: LookPreset) => {
    setPickedId(preset.id);
    setError(null);
    const key = cacheKey(photoId, preset.id);
    const cached = cacheRef.current[key];
    if (cached) {
      setPreviewUrl(cached);
      return;
    }
    setPreviewUrl(null);
    void generateOne(preset);
  };

  const onTabChange = (id: SimTab) => {
    setTab(id);
    setPickedId(null);
    setPreviewUrl(null);
    setError(null);
  };

  useEffect(() => {
    if (!activePhotoUrl || presets.length === 0) return;
    const first = presets[0];
    setPickedId(first.id);
    const key = cacheKey(photoId, first.id);
    if (cacheRef.current[key]) {
      setPreviewUrl(cacheRef.current[key]);
      return;
    }
    void generateOne(first);
  }, [tab, activePhotoUrl, photoId, presets, generateOne]);

  const onReferenceFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (refInputRef.current) refInputRef.current.value = "";
    if (!file || !activePhotoUrl) return;

    setLoading(true);
    setError(null);
    try {
      const raw = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () =>
          typeof reader.result === "string"
            ? resolve(reader.result)
            : reject(new Error("読み込み失敗"));
        reader.onerror = () => reject(new Error("読み込み失敗"));
        reader.readAsDataURL(file);
      });
      const compressed = await compressPhotoDataUrl(raw, 480, 0.85);
      const preset = await buildPresetFromReference(compressed, tab, "マイ参考");
      const saved = saveCustomPreset(preset);
      setCustomPresets(saved);
      onPick(preset);
    } catch (err) {
      setError(err instanceof Error ? err.message : "参考画像の処理に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return (
      <div className="space-y-4">
        <SectionTitle sub="Try On" title="新しい私を試す" />
        <Card>
          <p className="text-sm text-[var(--muted)]">
            診断後に、髪色・髪型・メイク・服を本気でプレビューできます。
          </p>
          <Link
            href="/app/scan"
            className="mt-3 inline-block rounded-full bg-[var(--ink)] px-4 py-2 text-xs font-bold text-white"
          >
            まず診断する
          </Link>
        </Card>
      </div>
    );
  }

  if (!activePhotoUrl) {
    return (
      <Card>
        <p className="text-sm text-[var(--muted)]">顔写真がある診断結果が必要です。</p>
        <Link href="/app/scan" className="mt-3 inline-block text-sm font-bold text-[var(--rose-dark)]">
          診断へ →
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <SectionTitle sub="Premium Try-On" title="新しい私を試す" />
      <p className="-mt-2 text-sm text-[var(--muted)]">
        タブごとに<strong className="text-[var(--ink)]">髪色・髪型・メイク・服</strong>
        を分けて反映。参考画像を送れば、その色や雰囲気をあなたに合わせて試せます。
      </p>

      {photos.length > 0 && (
        <Card>
          <PhotoGallery
            photos={photos}
            activeId={profile.activePhotoId ?? activePhoto?.id ?? null}
            onSelect={setActivePhoto}
            onRemove={photos.length > 1 ? removePhoto : undefined}
            maxPhotos={MAX_PHOTOS}
            compact
          />
        </Card>
      )}

      <div className="flex gap-1 overflow-x-auto pb-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onTabChange(t.id)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold ${
              tab === t.id
                ? "bg-[var(--ink)] text-white"
                : "bg-white text-[var(--muted)] ring-1 ring-[var(--rose-light)]/40"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab && (
        <p className="text-center text-[11px] font-semibold text-[var(--rose-dark)]">
          いまのモード：{activeTab.hint}
        </p>
      )}

      <Card className="border-2 border-dashed border-[var(--rose-dark)]/40 bg-[var(--cream)]/50">
        <p className="text-sm font-bold text-[var(--ink)]">📎 {tabRefLabel[tab]}</p>
        <p className="mt-1 text-xs text-[var(--muted)]">
          気になる髪色・服・メイクの写真を送ると、色を抽出してあなたに反映します。
        </p>
        <input
          ref={refInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => void onReferenceFile(e)}
        />
        <button
          type="button"
          disabled={loading}
          onClick={() => refInputRef.current?.click()}
          className="mt-3 w-full rounded-xl bg-[var(--rose-dark)] py-3 text-sm font-bold text-white disabled:opacity-50"
        >
          参考画像を送って試す
        </button>
        {tabCustoms.length > 0 && (
          <div className="mt-3 flex gap-2 overflow-x-auto">
            {tabCustoms.map((c) =>
              c.fromReference ? (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => onPick(c)}
                  className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-lg ring-2 ${
                    pickedId === c.id ? "ring-[var(--rose-dark)]" : "ring-transparent"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={c.fromReference} alt="" className="h-full w-full object-cover" />
                </button>
              ) : null
            )}
          </div>
        )}
      </Card>

      <Card className="p-3">
        <p className="mb-2 text-center text-xs font-bold text-[var(--muted)]">Before → After</p>
        {loading && (
          <div className="py-10 text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-[var(--rose-light)] border-t-[var(--rose-dark)]" />
            <p className="mt-3 text-sm font-semibold">反映中…</p>
          </div>
        )}
        {!loading && (
          <div className="grid grid-cols-2 gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activePhotoUrl}
              alt="元の写真"
              className="aspect-[3/4] w-full rounded-xl object-cover"
            />
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt={picked?.name || "変更イメージ"}
                className="aspect-[3/4] w-full rounded-xl object-cover ring-2 ring-[var(--rose-dark)]"
              />
            ) : (
              <div className="flex aspect-[3/4] items-center justify-center rounded-xl bg-[var(--cream)] text-center text-xs text-[var(--muted)]">
                {error ? "生成できませんでした" : "スタイルを選択"}
              </div>
            )}
          </div>
        )}
        {picked && !loading && (
          <p className="mt-2 text-center text-xs font-bold text-[var(--rose-dark)]">
            {picked.name}
            {picked.fromReference && (
              <span className="ml-1 text-[10px] font-normal">（参考画像から）</span>
            )}
          </p>
        )}
      </Card>

      {error && (
        <Card className="border border-red-200 bg-red-50/50">
          <p className="text-sm text-red-800">{error}</p>
        </Card>
      )}

      <Card>
        <p className="text-xs font-bold text-[var(--ink)]">プリセット</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {presets.map((p) => (
            <button
              key={p.id}
              type="button"
              disabled={loading}
              onClick={() => onPick(p)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold disabled:opacity-50 ${
                pickedId === p.id
                  ? "bg-[var(--rose-dark)] text-white"
                  : p.fromReference
                    ? "bg-[var(--rose-light)]/50 text-[var(--rose-dark)] ring-1 ring-[var(--rose-dark)]/30"
                    : "bg-[var(--cream)] text-[var(--ink)]"
              }`}
            >
              {p.fromReference && "📎 "}
              {p.name}
              {cache[cacheKey(photoId, p.id)] && <span className="ml-1 opacity-70">✓</span>}
            </button>
          ))}
        </div>
      </Card>

      <Card className="bg-[var(--cream)]/60">
        <p className="text-xs leading-relaxed text-[var(--muted)]">
          ※
          髪はHSLで色替え、顔はメイクのみ、体は服色のみ反映（タブごとに分離）。参考画像は色・雰囲気を抽出。実写と完全一致する合成ではありませんが、サロン・お買い物の参考に最適です。
        </p>
      </Card>
    </div>
  );
}
