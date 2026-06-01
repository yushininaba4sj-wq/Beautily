"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Card, SectionTitle } from "@/components/Card";
import { useProfile } from "@/components/ProfileProvider";
import {
  buildFinishPreset,
  HAIR_COLOR_PRESETS,
  HAIR_STYLE_PRESETS,
  MAKEUP_PRESETS,
  presetsForCategory,
  type LookCategory,
  type LookPreset,
} from "@/lib/lookPresets";
import { renderLookPreview } from "@/lib/lookRenderer";

type SimTab = LookCategory;

const tabs: { id: SimTab; label: string }[] = [
  { id: "hairColor", label: "髪色" },
  { id: "hairStyle", label: "髪型" },
  { id: "makeup", label: "メイク" },
  { id: "fashion", label: "ファッション" },
  { id: "finish", label: "完成形" },
];

export default function SimulatePage() {
  const { profile } = useProfile();
  const [tab, setTab] = useState<SimTab>("hairColor");
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [cache, setCache] = useState<Record<string, string>>({});
  const cacheRef = useRef(cache);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cacheRef.current = cache;
  }, [cache]);

  const presets = useMemo(() => {
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

  const picked = presets.find((p) => p.id === pickedId) || null;

  const generateOne = useCallback(
    async (preset: LookPreset) => {
      if (!profile?.photoUrl) return;

      const cached = cacheRef.current[preset.id];
      if (cached) {
        setPreviewUrl(cached);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);
      setPreviewUrl(null);

      try {
        const imageUrl = await renderLookPreview(profile.photoUrl, preset);
        setCache((c) => ({ ...c, [preset.id]: imageUrl }));
        cacheRef.current = { ...cacheRef.current, [preset.id]: imageUrl };
        setPreviewUrl(imageUrl);
      } catch (e) {
        const msg =
          e instanceof Error ? e.message : "画像を生成できませんでした";
        setError(msg);
      } finally {
        setLoading(false);
      }
    },
    [profile?.photoUrl]
  );

  const onPick = (preset: LookPreset) => {
    setPickedId(preset.id);
    setError(null);
    const cached = cacheRef.current[preset.id];
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

  // タブ切替時は先頭スタイルを自動選択してプレビュー生成
  useEffect(() => {
    if (!profile?.photoUrl || presets.length === 0) return;
    const first = presets[0];
    setPickedId(first.id);
    const cached = cacheRef.current[first.id];
    if (cached) {
      setPreviewUrl(cached);
      return;
    }
    void generateOne(first);
  }, [tab, profile?.photoUrl, presets, generateOne]);

  if (!profile) {
    return (
      <div className="space-y-4">
        <SectionTitle sub="Simulation" title="シミュレーション" />
        <Card>
          <p className="text-sm text-[var(--muted)]">
            診断後に、あなたの写真で髪色・メイク・ファッションの変更イメージを確認できます。
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

  if (!profile.photoUrl) {
    return (
      <Card>
        <p className="text-sm text-[var(--muted)]">
          顔写真がある診断結果が必要です。もう一度診断してください。
        </p>
        <Link href="/app/scan" className="mt-3 inline-block text-sm font-bold text-[var(--rose-dark)]">
          診断へ →
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <SectionTitle sub="Simulation" title="シミュレーション" />
      <p className="-mt-2 text-sm text-[var(--muted)]">
        スタイルをタップすると、あなたの写真に髪色・メイク・色味を反映したプレビューが表示されます。
      </p>

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

      <Card className="p-3">
        <p className="mb-2 text-center text-xs font-bold text-[var(--muted)]">プレビュー</p>
        {loading && (
          <div className="py-8 text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-[var(--rose-light)] border-t-[var(--rose-dark)]" />
            <p className="mt-3 text-sm font-semibold">生成中…</p>
          </div>
        )}
        {!loading && (
          <div className="grid grid-cols-2 gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={profile.photoUrl}
              alt="元の写真"
              className="aspect-[3/4] w-full rounded-xl object-cover"
            />
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt={picked?.name || "変更イメージ"}
                className="aspect-[3/4] w-full rounded-xl object-cover ring-2 ring-[var(--rose-dark)]/40"
              />
            ) : (
              <div className="flex aspect-[3/4] items-center justify-center rounded-xl bg-[var(--cream)] text-center text-xs text-[var(--muted)]">
                {error ? "生成できませんでした" : "スタイルを選ぶと表示されます"}
              </div>
            )}
          </div>
        )}
        {picked && !loading && (
          <p className="mt-2 text-center text-xs font-bold text-[var(--rose-dark)]">
            {picked.name}
            <span className="ml-1 font-normal text-[var(--muted)]">
              ({categoryLabel(picked.category)})
            </span>
          </p>
        )}
      </Card>

      {error && (
        <Card className="border border-red-200 bg-red-50/50">
          <p className="text-sm text-red-800">{error}</p>
          {picked && (
            <button
              type="button"
              onClick={() => void generateOne(picked)}
              className="mt-2 text-xs font-bold text-[var(--rose-dark)]"
            >
              再試行 →
            </button>
          )}
        </Card>
      )}

      <Card>
        <p className="text-xs font-bold text-[var(--ink)]">スタイルを選ぶ</p>
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
                  : "bg-[var(--cream)] text-[var(--ink)]"
              }`}
            >
              {p.name}
              {cache[p.id] && <span className="ml-1 opacity-70">✓</span>}
            </button>
          ))}
        </div>
      </Card>

      {picked && (
        <button
          type="button"
          disabled={loading}
          onClick={() => void generateOne(picked)}
          className="w-full rounded-xl border border-[var(--rose-light)] py-3 text-sm font-bold text-[var(--ink)] disabled:opacity-50"
        >
          {loading ? "生成中…" : "このスタイルを再生成"}
        </button>
      )}

      <Card className="bg-[var(--cream)]/60">
        <p className="text-xs leading-relaxed text-[var(--muted)]">
          ※ お写真に髪色・メイク・色味を重ねたプレビューです。実際のカットや施術は美容師・メイクで調整してください。
        </p>
      </Card>
    </div>
  );
}

function categoryLabel(cat: LookCategory): string {
  const map: Record<LookCategory, string> = {
    hairColor: "髪色",
    hairStyle: "髪型",
    makeup: "メイク",
    fashion: "ファッション",
    finish: "完成形",
  };
  return map[cat] || "";
}
