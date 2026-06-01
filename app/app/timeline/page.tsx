"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Card, SectionTitle, Tag } from "@/components/Card";
import { useProfile } from "@/components/ProfileProvider";
import {
  ELEMENT_CATEGORIES,
  ELEMENT_ITEMS,
  getItemsByCategory,
  getProfileElementTags,
  type ElementCategoryId,
} from "@/lib/beautyElements";
import { loadTimeline } from "@/lib/storage";
import { useEffect } from "react";
import type { TimelineEntry } from "@/lib/types";

export default function TimelinePage() {
  const { profile } = useProfile();
  const [category, setCategory] = useState<ElementCategoryId | "all">("all");
  const [nameFilter, setNameFilter] = useState<string | null>(null);
  const [history, setHistory] = useState<TimelineEntry[]>([]);
  const [tab, setTab] = useState<"explore" | "history">("explore");

  useEffect(() => {
    setHistory(loadTimeline());
  }, [profile]);

  const items = useMemo(() => {
    let list =
      category === "all"
        ? ELEMENT_ITEMS
        : getItemsByCategory(category);
    if (nameFilter) {
      list = list.filter((i) => i.name === nameFilter);
    }
    return list;
  }, [category, nameFilter]);

  const myTags = profile ? getProfileElementTags(profile) : [];

  const filteredHistory = useMemo(() => {
    if (!nameFilter && category === "all") return history;
    return history.filter((e) => {
      if (nameFilter) {
        return (
          e.personalColor === nameFilter ||
          e.boneStructure === nameFilter ||
          e.faceType === nameFilter ||
          e.animalFace === nameFilter ||
          e.label.includes(nameFilter)
        );
      }
      if (category === "personalColor") return true;
      if (category === "bone") return true;
      if (category === "faceType") return true;
      if (category === "animal") return true;
      return true;
    });
  }, [history, category, nameFilter]);

  const selectItem = (itemName: string, catId: ElementCategoryId) => {
    setCategory(catId);
    setNameFilter(itemName);
    setTab("explore");
  };

  return (
    <div className="space-y-5">
      <SectionTitle sub="Timeline" title="美容タイムライン" />
      <p className="-mt-2 text-sm text-[var(--muted)]">
        要素ごとに絞って調べられます。あなたの診断履歴もここに並びます。
      </p>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setTab("explore")}
          className={`flex-1 rounded-xl py-2 text-xs font-bold ${
            tab === "explore"
              ? "bg-[var(--ink)] text-white"
              : "bg-white ring-1 ring-[var(--rose-light)]/40"
          }`}
        >
          要素を調べる
        </button>
        <button
          type="button"
          onClick={() => setTab("history")}
          className={`flex-1 rounded-xl py-2 text-xs font-bold ${
            tab === "history"
              ? "bg-[var(--ink)] text-white"
              : "bg-white ring-1 ring-[var(--rose-light)]/40"
          }`}
        >
          あなたの記録
        </button>
      </div>

      {profile && tab === "explore" && (
        <Card>
          <p className="text-xs font-bold text-[var(--rose-dark)]">あなたの診断</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {myTags.map((t) => (
              <button
                key={`${t.categoryId}-${t.name}`}
                type="button"
                onClick={() => selectItem(t.name, t.categoryId)}
                className="rounded-full bg-[var(--rose-dark)] px-3 py-1 text-xs font-bold text-white"
              >
                {t.name}
              </button>
            ))}
          </div>
        </Card>
      )}

      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => {
            setCategory("all");
            setNameFilter(null);
          }}
          className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold ${
            category === "all" && !nameFilter
              ? "bg-[var(--ink)] text-white"
              : "bg-white text-[var(--muted)] ring-1 ring-[var(--rose-light)]/40"
          }`}
        >
          すべて
        </button>
        {ELEMENT_CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => {
              setCategory(c.id);
              setNameFilter(null);
            }}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold ${
              category === c.id && !nameFilter
                ? "bg-[var(--rose-dark)] text-white"
                : "bg-white text-[var(--muted)] ring-1 ring-[var(--rose-light)]/40"
            }`}
          >
            {c.short}
          </button>
        ))}
      </div>

      {nameFilter && (
        <button
          type="button"
          onClick={() => setNameFilter(null)}
          className="text-xs font-bold text-[var(--rose-dark)]"
        >
          「{nameFilter}」の絞り込みを解除 ×
        </button>
      )}

      {tab === "explore" && (
        <div className="space-y-3">
          {items.map((item) => {
            const isMine = myTags.some(
              (t) => t.name === item.name && t.categoryId === item.categoryId
            );
            return (
              <Card
                key={item.id}
                className={isMine ? "ring-2 ring-[var(--rose-dark)]/40" : ""}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Tag>
                      {
                        ELEMENT_CATEGORIES.find((c) => c.id === item.categoryId)
                          ?.label
                      }
                    </Tag>
                    <h3 className="font-display mt-2 text-xl font-semibold">
                      {item.name}
                    </h3>
                    {isMine && (
                      <span className="mt-1 inline-block text-[10px] font-bold text-[var(--rose-dark)]">
                        あなたの診断
                      </span>
                    )}
                  </div>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                  {item.summary}
                </p>
                <p className="mt-3 text-xs font-bold">おすすめ</p>
                <ul className="mt-1 space-y-1 text-sm text-[var(--ink)]">
                  {item.tips.map((t) => (
                    <li key={t}>· {t}</li>
                  ))}
                </ul>
                {item.avoid && item.avoid.length > 0 && (
                  <>
                    <p className="mt-3 text-xs font-bold text-[var(--muted)]">
                      避けた方がよい
                    </p>
                    <ul className="mt-1 text-sm text-[var(--muted)]">
                      {item.avoid.map((a) => (
                        <li key={a}>· {a}</li>
                      ))}
                    </ul>
                  </>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {tab === "history" && (
        <div className="space-y-3">
          {!history.length && (
            <Card>
              <p className="text-sm text-[var(--muted)]">
                まだ記録がありません。診断するとここに追加されます。
              </p>
              <Link
                href="/app/scan"
                className="mt-3 inline-block text-sm font-bold text-[var(--rose-dark)]"
              >
                診断する →
              </Link>
            </Card>
          )}
          {filteredHistory.map((e) => (
            <Card key={e.id} className="flex gap-3">
              {e.photoUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={e.photoUrl}
                  alt=""
                  className="h-16 w-16 shrink-0 rounded-xl object-cover"
                />
              )}
              <div>
                <p className="text-xs text-[var(--muted)]">
                  {new Date(e.analyzedAt).toLocaleString("ja-JP")}
                </p>
                <p className="font-bold">{e.label}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  <button
                    type="button"
                    onClick={() => selectItem(e.personalColor, "personalColor")}
                  >
                    <Tag>{e.personalColor}</Tag>
                  </button>
                  <button
                    type="button"
                    onClick={() => selectItem(e.boneStructure, "bone")}
                  >
                    <Tag>{e.boneStructure}</Tag>
                  </button>
                  <button
                    type="button"
                    onClick={() => selectItem(e.faceType, "faceType")}
                  >
                    <Tag>{e.faceType}</Tag>
                  </button>
                  <button
                    type="button"
                    onClick={() => selectItem(e.animalFace, "animal")}
                  >
                    <Tag>{e.animalFace}</Tag>
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
