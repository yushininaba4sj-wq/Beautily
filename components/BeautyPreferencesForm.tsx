"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, Tag } from "@/components/Card";
import { useProfile } from "@/components/ProfileProvider";
import {
  PERSONAL_COLORS,
  SKIN_CONDITIONS,
  SKIN_CONCERNS,
  SKIN_TYPES,
} from "@/lib/productCatalog";
import { formatYen } from "@/lib/recommendations";
import { loadPreferences, savePreferences } from "@/lib/storage";
import type {
  BeautyPreferences,
  PersonalColor,
  SkinCondition,
  SkinConcern,
  SkinType,
} from "@/lib/types";

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function splitBudget(total: number) {
  const skincare = Math.round(total * 0.38);
  const makeup = Math.round(total * 0.32);
  return {
    budgetSkincare: skincare,
    budgetMakeup: makeup,
    budgetFashion: total - skincare - makeup,
  };
}

function ChipGroup<T extends string>({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: readonly T[];
  selected: T[];
  onToggle: (value: T) => void;
}) {
  return (
    <div>
      <p className="text-sm font-bold text-[var(--ink)]">{label}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((option) => {
          const on = selected.includes(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => onToggle(option)}
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                on
                  ? "bg-[var(--rose-dark)] text-white"
                  : "bg-[var(--cream)] text-[var(--muted)] ring-1 ring-[var(--rose-light)]/30"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

type BeautyPreferencesFormProps = {
  onSaved?: (prefs: BeautyPreferences) => void;
};

export function BeautyPreferencesForm({ onSaved }: BeautyPreferencesFormProps) {
  const { profile } = useProfile();
  const router = useRouter();
  const [prefs, setPrefs] = useState<BeautyPreferences | null>(null);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  useEffect(() => {
    setPrefs(loadPreferences(profile));
  }, [profile]);

  if (!prefs) {
    return <p className="text-sm text-[var(--muted)]">読み込み中…</p>;
  }

  function updateMonthlyBudget(total: number) {
    const monthlyBudget = clamp(total, 1000, 200000);
    const split = splitBudget(monthlyBudget);
    setPrefs((current) =>
      current
        ? {
            ...current,
            monthlyBudget,
            ...(current.useCustomBudget ? {} : split),
          }
        : current,
    );
  }

  function toggle<T extends string>(key: keyof BeautyPreferences, value: T) {
    setPrefs((current) => {
      if (!current) return current;
      const list = current[key] as T[];
      const next = list.includes(value)
        ? list.filter((item) => item !== value)
        : [...list, value];
      return { ...current, [key]: next };
    });
  }

  function save() {
    if (!prefs) return;
    savePreferences(prefs);
    setSavedMsg("設定を保存しました");
    onSaved?.(prefs);
    setTimeout(() => setSavedMsg(null), 2500);
  }

  const customTotal =
    prefs.budgetSkincare + prefs.budgetMakeup + prefs.budgetFashion;

  return (
    <div className="space-y-5">
      <Card>
        <p className="text-sm font-bold">年齢</p>
        <div className="mt-3 flex items-center gap-3">
          <input
            type="number"
            min={15}
            max={80}
            value={prefs.age}
            onChange={(e) =>
              setPrefs({
                ...prefs,
                age: clamp(Number(e.target.value) || 20, 15, 80),
              })
            }
            className="w-24 rounded-xl border border-[var(--rose-light)]/40 px-3 py-2 text-center text-lg font-bold text-[var(--rose-dark)]"
          />
          <span className="text-sm text-[var(--muted)]">歳</span>
          <input
            type="range"
            min={15}
            max={55}
            value={Math.min(prefs.age, 55)}
            onChange={(e) => setPrefs({ ...prefs, age: Number(e.target.value) })}
            className="flex-1 accent-[var(--rose-dark)]"
          />
        </div>
      </Card>

      <Card>
        <p className="text-sm font-bold">月の美容予算（合計）</p>
        <p className="mt-1 text-xs text-[var(--muted)]">
          スキンケア・メイク・服の合計。数字を直接入力できます。
        </p>
        <div className="mt-3 flex items-center gap-2">
          <span className="text-sm font-bold text-[var(--muted)]">¥</span>
          <input
            type="number"
            min={1000}
            max={200000}
            step={500}
            value={prefs.monthlyBudget}
            onChange={(e) => updateMonthlyBudget(Number(e.target.value) || 0)}
            className="flex-1 rounded-xl border border-[var(--rose-light)]/40 px-3 py-2.5 text-lg font-bold text-[var(--rose-dark)]"
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {[3000, 5000, 10000, 15000, 20000, 30000, 50000].map((amount) => (
            <button
              key={amount}
              type="button"
              onClick={() => updateMonthlyBudget(amount)}
              className={`rounded-full px-3 py-1 text-[11px] font-bold ${
                prefs.monthlyBudget === amount
                  ? "bg-[var(--rose-dark)] text-white"
                  : "bg-[var(--cream)] text-[var(--rose-dark)]"
              }`}
            >
              ¥{amount.toLocaleString()}
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold">カテゴリ別の予算</p>
            <p className="mt-1 text-xs text-[var(--muted)]">
              自分でスキンケア・メイク・服の予算を分けて設定
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={prefs.useCustomBudget}
            onClick={() =>
              setPrefs({
                ...prefs,
                useCustomBudget: !prefs.useCustomBudget,
                ...(!prefs.useCustomBudget ? {} : splitBudget(prefs.monthlyBudget)),
              })
            }
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold ${
              prefs.useCustomBudget
                ? "bg-[var(--rose-dark)] text-white"
                : "bg-[var(--cream)] text-[var(--muted)]"
            }`}
          >
            {prefs.useCustomBudget ? "ON" : "OFF"}
          </button>
        </div>

        {prefs.useCustomBudget ? (
          <div className="mt-4 space-y-3">
            {(
              [
                ["budgetSkincare", "スキンケア"],
                ["budgetMakeup", "メイク"],
                ["budgetFashion", "ファッション"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="block">
                <span className="text-xs font-bold text-[var(--muted)]">{label}</span>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-sm text-[var(--muted)]">¥</span>
                  <input
                    type="number"
                    min={0}
                    max={200000}
                    step={500}
                    value={prefs[key]}
                    onChange={(e) =>
                      setPrefs({
                        ...prefs,
                        [key]: clamp(Number(e.target.value) || 0, 0, 200000),
                      })
                    }
                    className="flex-1 rounded-xl border border-[var(--rose-light)]/40 px-3 py-2 text-sm font-bold"
                  />
                </div>
              </label>
            ))}
            <p className="text-xs text-[var(--muted)]">
              カテゴリ合計: {formatYen(customTotal)}
              {customTotal !== prefs.monthlyBudget && (
                <span className="text-[var(--rose-dark)]">
                  {" "}
                  （合計予算 {formatYen(prefs.monthlyBudget)} と異なります）
                </span>
              )}
            </p>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-xl bg-[var(--cream)]/60 p-2">
              <p className="text-[var(--muted)]">スキンケア</p>
              <p className="mt-1 font-bold">{formatYen(prefs.budgetSkincare)}</p>
            </div>
            <div className="rounded-xl bg-[var(--cream)]/60 p-2">
              <p className="text-[var(--muted)]">メイク</p>
              <p className="mt-1 font-bold">{formatYen(prefs.budgetMakeup)}</p>
            </div>
            <div className="rounded-xl bg-[var(--cream)]/60 p-2">
              <p className="text-[var(--muted)]">服</p>
              <p className="mt-1 font-bold">{formatYen(prefs.budgetFashion)}</p>
            </div>
          </div>
        )}
      </Card>

      <Card className="space-y-5">
        <ChipGroup<SkinType>
          label="肌質"
          options={SKIN_TYPES}
          selected={prefs.skinTypes}
          onToggle={(value) => toggle("skinTypes", value)}
        />
        <ChipGroup<SkinCondition>
          label="肌の状態（赤み・くすみなど）"
          options={SKIN_CONDITIONS}
          selected={prefs.skinConditions}
          onToggle={(value) => toggle("skinConditions", value)}
        />
        <ChipGroup<SkinConcern>
          label="肌の悩み"
          options={SKIN_CONCERNS}
          selected={prefs.concerns}
          onToggle={(value) => toggle("concerns", value)}
        />
        <div>
          <p className="text-sm font-bold text-[var(--ink)]">パーソナルカラー</p>
          {profile?.personalColor && (
            <p className="mt-1 text-xs text-[var(--muted)]">
              診断結果: {profile.personalColor}（変更もできます）
            </p>
          )}
          <div className="mt-2 flex flex-wrap gap-2">
            {PERSONAL_COLORS.map((color) => {
              const on = prefs.personalColor === color;
              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => setPrefs({ ...prefs, personalColor: color as PersonalColor })}
                  className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                    on
                      ? "bg-[var(--rose-dark)] text-white"
                      : "bg-[var(--cream)] text-[var(--muted)] ring-1 ring-[var(--rose-light)]/30"
                  }`}
                >
                  {color}
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      <Card className="bg-[var(--cream)]/50">
        <p className="text-xs font-bold text-[var(--rose-dark)]">保存される内容</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Tag>{prefs.age}歳</Tag>
          <Tag>合計 {formatYen(prefs.monthlyBudget)}</Tag>
          {prefs.skinTypes.map((s) => (
            <Tag key={s}>{s}</Tag>
          ))}
          {prefs.skinConditions.map((s) => (
            <Tag key={s}>{s}</Tag>
          ))}
          {prefs.concerns.map((s) => (
            <Tag key={s}>{s}</Tag>
          ))}
          {prefs.personalColor && <Tag>{prefs.personalColor}</Tag>}
        </div>
        <p className="mt-2 text-[11px] text-[var(--muted)]">
          設定はこの端末に保存され、おすすめ・コスメ・服の提案に使われます。
        </p>
      </Card>

      {savedMsg && (
        <p className="rounded-xl bg-[var(--rose-light)]/30 px-4 py-3 text-center text-sm font-bold text-[var(--rose-dark)]">
          {savedMsg}
        </p>
      )}

      <button
        type="button"
        onClick={save}
        className="w-full rounded-xl bg-gradient-to-r from-[var(--rose-dark)] to-[var(--rose)] py-3.5 text-sm font-bold text-white"
      >
        設定を保存
      </button>
      <button
        type="button"
        onClick={() => {
          save();
          router.push("/app/recommend");
        }}
        className="w-full rounded-xl border border-[var(--rose-light)] py-3 text-sm font-bold text-[var(--rose-dark)]"
      >
        保存しておすすめを見る →
      </button>
    </div>
  );
}

export function SavedPreferencesSummary() {
  const { profile } = useProfile();
  const [prefs, setPrefs] = useState<BeautyPreferences | null>(null);

  useEffect(() => {
    setPrefs(loadPreferences(profile));
  }, [profile]);

  if (!prefs) return null;

  const hasAny =
    prefs.skinTypes.length > 0 ||
    prefs.concerns.length > 0 ||
    prefs.personalColor ||
    prefs.monthlyBudget !== 10000 ||
    prefs.age !== 20;

  return (
    <Card className="bg-[var(--cream)]/40">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold">マイ設定</p>
          {hasAny ? (
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Tag>{prefs.age}歳</Tag>
              <Tag>{formatYen(prefs.monthlyBudget)}</Tag>
              {prefs.skinTypes.slice(0, 2).map((s) => (
                <Tag key={s}>{s}</Tag>
              ))}
              {prefs.concerns.slice(0, 2).map((s) => (
                <Tag key={s}>{s}</Tag>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-xs text-[var(--muted)]">まだ設定されていません</p>
          )}
        </div>
        <Link
          href="/app/setup"
          className="shrink-0 rounded-full bg-white px-3 py-1.5 text-[11px] font-bold text-[var(--rose-dark)] ring-1 ring-[var(--rose-light)]/40"
        >
          編集
        </Link>
      </div>
    </Card>
  );
}
