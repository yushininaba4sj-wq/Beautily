"use client";

import { useState } from "react";
import { Card, SectionTitle, Tag } from "@/components/Card";
import { useProfile } from "@/components/ProfileProvider";

type SimTab = "hair" | "color" | "makeup" | "ideal" | "finish";

const hairOpts = ["ボブ", "ロング", "レイヤー", "前髪あり", "前髪なし"];
const colorOpts = ["ミルクティー", "グレージュ", "ピンクブラウン", "ラベンダー", "黒髪"];
const makeupOpts = ["韓国アイドル風", "清楚系", "女優系", "大人っぽい", "ガーリー"];
const idealOpts = ["韓国アイドル系", "女優系", "モデル系", "お姉さん系"];

export default function SimulatePage() {
  const { profile } = useProfile();
  const [tab, setTab] = useState<SimTab>("finish");
  const [selected, setSelected] = useState<string[]>([]);
  const [generated, setGenerated] = useState(false);

  const tabs: { id: SimTab; label: string }[] = [
    { id: "finish", label: "完成形" },
    { id: "hair", label: "髪型" },
    { id: "color", label: "髪色" },
    { id: "makeup", label: "メイク" },
    { id: "ideal", label: "理想像" },
  ];

  const options =
    tab === "hair"
      ? hairOpts
      : tab === "color"
        ? colorOpts
        : tab === "makeup"
          ? makeupOpts
          : tab === "ideal"
            ? idealOpts
            : [];

  const runSim = () => {
    setGenerated(false);
    setTimeout(() => setGenerated(true), 1500);
  };

  if (!profile) {
    return (
      <Card>
        <p className="text-sm text-[var(--muted)]">診断後にシミュレーションが利用できます。</p>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <SectionTitle sub="Simulation" title="シミュレーション" />
      <p className="-mt-2 text-xs text-[var(--muted)]">
        顔写真から変更後のイメージを生成（デモ：本番は画像生成API連携）
      </p>

      <div className="flex gap-1 overflow-x-auto pb-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              setTab(t.id);
              setSelected([]);
              setGenerated(false);
            }}
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

      <div className="grid grid-cols-2 gap-3">
        {profile.photoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.photoUrl}
            alt="Before"
            className="aspect-[3/4] rounded-2xl object-cover"
          />
        )}
        <div
          className={`flex aspect-[3/4] flex-col items-center justify-center rounded-2xl p-4 text-center ${
            generated
              ? "bg-gradient-to-br from-[var(--rose-light)] to-[var(--rose-dark)] text-white"
              : "bg-[var(--cream)] text-[var(--muted)]"
          }`}
        >
          {generated ? (
            <>
              <p className="text-xs font-bold opacity-80">After（生成イメージ）</p>
              <p className="mt-2 font-display text-lg">
                {tab === "finish"
                  ? "最も似合う完成形"
                  : selected.join(" · ") || "選択してください"}
              </p>
              <p className="mt-2 text-[10px] opacity-70">
                ※デモ表示。実装時は画像生成APIで差し替え
              </p>
            </>
          ) : (
            <p className="text-xs">生成ボタンを押すとプレビュー</p>
          )}
        </div>
      </div>

      {tab !== "finish" && (
        <Card>
          <p className="mb-2 text-xs font-bold">オプション選択</p>
          <div className="flex flex-wrap gap-2">
            {options.map((o) => (
              <button
                key={o}
                type="button"
                onClick={() =>
                  setSelected((s) =>
                    s.includes(o) ? s.filter((x) => x !== o) : [...s, o]
                  )
                }
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  selected.includes(o)
                    ? "bg-[var(--rose-dark)] text-white"
                    : "bg-[var(--cream)] text-[var(--ink)]"
                }`}
              >
                {o}
              </button>
            ))}
          </div>
        </Card>
      )}

      {tab === "finish" && profile && (
        <Card>
          <p className="text-sm text-[var(--muted)]">
            診断結果に基づく「{profile.faceType} × {profile.animalFace}」の最適完成形
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {profile.hairStyle.slice(0, 2).map((h) => (
              <Tag key={h}>{h}</Tag>
            ))}
            {profile.hairColor.slice(0, 1).map((h) => (
              <Tag key={h}>{h}</Tag>
            ))}
          </div>
        </Card>
      )}

      <button
        type="button"
        onClick={runSim}
        className="w-full rounded-xl bg-[var(--ink)] py-3 text-sm font-bold text-white"
      >
        {generated ? "再生成" : "シミュレーション生成"}
      </button>
    </div>
  );
}
