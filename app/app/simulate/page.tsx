"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, SectionTitle, Tag } from "@/components/Card";
import { useProfile } from "@/components/ProfileProvider";
import {
  buildFinishPreset,
  FASHION_PRESETS,
  HAIR_COLOR_PRESETS,
  HAIR_STYLE_PRESETS,
  MAKEUP_PRESETS,
  presetsForCategory,
  type LookCategory,
  type LookPreset,
} from "@/lib/lookPresets";
import { renderLookPreview } from "@/lib/lookRenderer";

type SimTab = "gallery" | LookCategory;

const tabs: { id: SimTab; label: string }[] = [
  { id: "gallery", label: "おすすめ一覧" },
  { id: "hairColor", label: "髪色" },
  { id: "hairStyle", label: "髪型" },
  { id: "makeup", label: "メイク" },
  { id: "fashion", label: "ファッション" },
  { id: "finish", label: "完成形" },
];

type GalleryItem = { preset: LookPreset; imageUrl: string };

export default function SimulatePage() {
  const { profile } = useProfile();
  const [tab, setTab] = useState<SimTab>("gallery");
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const presets = useMemo(() => {
    if (tab === "gallery" && profile) {
      const names = new Set<string>();
      const list: LookPreset[] = [];
      const add = (p: LookPreset) => {
        if (!names.has(p.id)) {
          names.add(p.id);
          list.push(p);
        }
      };
      profile.hairColor.slice(0, 3).forEach((n) => {
        const p = HAIR_COLOR_PRESETS.find((x) => x.name === n);
        if (p) add(p);
      });
      HAIR_COLOR_PRESETS.slice(0, 4).forEach(add);
      profile.hairStyle.slice(0, 2).forEach((n) => {
        const p = HAIR_STYLE_PRESETS.find((x) => x.name === n);
        if (p) add(p);
      });
      HAIR_STYLE_PRESETS.slice(0, 3).forEach(add);
      MAKEUP_PRESETS.slice(0, 4).forEach(add);
      profile.fashion.slice(0, 2).forEach((n) => {
        const p = FASHION_PRESETS.find((x) => x.name === n || n.includes(x.name));
        if (p) add(p);
      });
      FASHION_PRESETS.slice(0, 4).forEach(add);
      return list;
    }
    if (tab === "finish" && profile) {
      return [
        buildFinishPreset(
          profile.hairColor[0] || "ミルクティー",
          "韓流きれいめ",
          profile.fashion[0] || "韓国きれいめ"
        ),
      ];
    }
    if (tab === "gallery") return [...HAIR_COLOR_PRESETS.slice(0, 3), ...MAKEUP_PRESETS.slice(0, 2)];
    return presetsForCategory(tab);
  }, [tab, profile]);

  const generate = useCallback(async () => {
    if (!profile?.photoUrl) return;
    setLoading(true);
    setProgress(0);
    setItems([]);
    setSelectedId(null);

    const results: GalleryItem[] = [];
    const total = presets.length;
    for (let i = 0; i < presets.length; i++) {
      const preset = presets[i];
      try {
        const imageUrl = await renderLookPreview(profile.photoUrl, preset);
        results.push({ preset, imageUrl });
        setItems([...results]);
        setProgress(Math.round(((i + 1) / total) * 100));
      } catch {
        /* skip */
      }
    }
    if (results.length) setSelectedId(results[0].preset.id);
    setLoading(false);
  }, [profile?.photoUrl, presets]);

  useEffect(() => {
    if (profile?.photoUrl) void generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- tab/presets change only
  }, [tab, profile?.photoUrl, presets]);

  const selected = items.find((x) => x.preset.id === selectedId) || items[0];

  if (!profile) {
    return (
      <Card>
        <p className="text-sm text-[var(--muted)]">診断後にシミュレーションが利用できます。</p>
      </Card>
    );
  }

  if (!profile.photoUrl) {
    return (
      <Card>
        <p className="text-sm text-[var(--muted)]">
          顔写真がある診断結果が必要です。もう一度診断してください。
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <SectionTitle sub="Lookbook" title="ビジュアルシミュレーション" />
      <p className="-mt-2 text-sm text-[var(--muted)]">
        あなたの写真をもとに、髪色・髪型・メイク・ファッション系統ごとのイメージ画像を自動で作ります。
      </p>

      <div className="flex gap-1 overflow-x-auto pb-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
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

      {loading && (
        <Card className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-[var(--rose-light)] border-t-[var(--rose-dark)]" />
          <p className="mt-3 text-sm font-semibold">イメージを生成中…</p>
          <div className="mx-auto mt-3 h-2 max-w-xs overflow-hidden rounded-full bg-[var(--cream)]">
            <div
              className="h-full rounded-full bg-[var(--rose-dark)] transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-[var(--muted)]">{items.length} / {presets.length} 枚</p>
        </Card>
      )}

      {selected && !loading && (
        <Card className="p-3">
          <p className="mb-2 text-center text-xs font-bold text-[var(--rose-dark)]">
            {selected.preset.name}
            <span className="ml-2 font-normal text-[var(--muted)]">
              {categoryLabel(selected.preset.category)}
            </span>
          </p>
          <div className="grid grid-cols-2 gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={profile.photoUrl}
              alt="元の写真"
              className="aspect-[3/4] w-full rounded-xl object-cover"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selected.imageUrl}
              alt={selected.preset.name}
              className="aspect-[3/4] w-full rounded-xl object-cover ring-2 ring-[var(--rose-dark)]/40"
            />
          </div>
          <p className="mt-2 text-center text-[10px] text-[var(--muted)]">
            左：現在 · 右：変更イメージ（髪色・メイク・トーンを反映）
          </p>
        </Card>
      )}

      {!loading && items.length > 0 && (
        <>
          <p className="text-xs font-bold text-[var(--ink)]">
            バリエーション（{items.length}枚）— タップで拡大
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {items.map((item) => (
              <button
                key={item.preset.id}
                type="button"
                onClick={() => setSelectedId(item.preset.id)}
                className={`overflow-hidden rounded-xl text-left ring-2 transition ${
                  selectedId === item.preset.id || (!selectedId && item === items[0])
                    ? "ring-[var(--rose-dark)]"
                    : "ring-transparent"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.imageUrl}
                  alt={item.preset.name}
                  className="aspect-[3/4] w-full object-cover"
                />
                <div className="bg-white px-2 py-1.5">
                  <p className="text-[11px] font-bold leading-tight">{item.preset.name}</p>
                  <p className="text-[9px] text-[var(--muted)]">
                    {categoryLabel(item.preset.category)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {!loading && items.length === 0 && (
        <Card>
          <p className="text-sm text-[var(--muted)]">画像を生成できませんでした。</p>
        </Card>
      )}

      <button
        type="button"
        disabled={loading}
        onClick={() => void generate()}
        className="w-full rounded-xl bg-[var(--ink)] py-3 text-sm font-bold text-white disabled:opacity-50"
      >
        {loading ? "生成中…" : "画像を再生成"}
      </button>

      <Card className="bg-[var(--cream)]/60">
        <p className="text-xs leading-relaxed text-[var(--muted)]">
          ※ お写真に髪色・メイク・色味のフィルターを重ねたプレビューです。実際のカットや施術は美容師・メイクで調整してください。より精密な仕上がりはサロンでご相談ください。
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
