"use client";

import { useEffect, useState } from "react";
import { Card, Tag } from "@/components/Card";
import { useProfile } from "@/components/ProfileProvider";
import {
  PERSONAL_COLORS,
  SKIN_CONDITIONS,
  SKIN_CONCERNS,
  SKIN_TYPES,
} from "@/lib/productCatalog";
import { loadPreferences, savePreferences } from "@/lib/storage";
import type { BeautyPreferences, PersonalColor, SkinCondition, SkinConcern, SkinType } from "@/lib/types";

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
  submitLabel?: string;
};

export function BeautyPreferencesForm({
  onSaved,
  submitLabel = "保存しておすすめを見る",
}: BeautyPreferencesFormProps) {
  const { profile } = useProfile();
  const [prefs, setPrefs] = useState<BeautyPreferences | null>(null);

  useEffect(() => {
    setPrefs(loadPreferences(profile));
  }, [profile]);

  if (!prefs) {
    return <p className="text-sm text-[var(--muted)]">読み込み中…</p>;
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
    onSaved?.(prefs);
  }

  return (
    <div className="space-y-5">
      <Card>
        <p className="text-sm font-bold">年齢</p>
        <div className="mt-3 flex items-center gap-3">
          <input
            type="range"
            min={15}
            max={55}
            value={prefs.age}
            onChange={(e) => setPrefs({ ...prefs, age: Number(e.target.value) })}
            className="flex-1 accent-[var(--rose-dark)]"
          />
          <span className="w-12 text-right text-lg font-bold text-[var(--rose-dark)]">
            {prefs.age}歳
          </span>
        </div>
      </Card>

      <Card>
        <p className="text-sm font-bold">月の美容予算</p>
        <p className="mt-1 text-xs text-[var(--muted)]">
          スキンケア・メイク・服の合計予算（円）
        </p>
        <div className="mt-3 flex items-center gap-3">
          <input
            type="range"
            min={3000}
            max={50000}
            step={1000}
            value={prefs.monthlyBudget}
            onChange={(e) =>
              setPrefs({ ...prefs, monthlyBudget: Number(e.target.value) })
            }
            className="flex-1 accent-[var(--rose-dark)]"
          />
          <span className="min-w-[72px] text-right text-sm font-bold text-[var(--rose-dark)]">
            ¥{prefs.monthlyBudget.toLocaleString()}
          </span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {[5000, 10000, 15000, 20000, 30000].map((amount) => (
            <button
              key={amount}
              type="button"
              onClick={() => setPrefs({ ...prefs, monthlyBudget: amount })}
              className="rounded-full bg-[var(--cream)] px-3 py-1 text-[11px] font-bold text-[var(--rose-dark)]"
            >
              ¥{amount.toLocaleString()}
            </button>
          ))}
        </div>
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
        <p className="text-xs font-bold text-[var(--rose-dark)]">入力内容</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Tag>{prefs.age}歳</Tag>
          <Tag>予算 ¥{prefs.monthlyBudget.toLocaleString()}</Tag>
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
      </Card>

      <button
        type="button"
        onClick={save}
        className="w-full rounded-xl bg-gradient-to-r from-[var(--rose-dark)] to-[var(--rose)] py-3.5 text-sm font-bold text-white"
      >
        {submitLabel}
      </button>
    </div>
  );
}
