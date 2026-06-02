"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Card, SectionTitle, Tag } from "@/components/Card";
import { useProfile } from "@/components/ProfileProvider";
import {
  ELEMENT_CATEGORIES,
  EXTENDED_CATEGORIES,
  FOUNDATION_CATEGORIES,
  getItemsByCategory,
  getProfileElementTags,
  searchElements,
  type ElementCategoryId,
  type ElementItem,
} from "@/lib/beautyElements";
import {
  FEED_TOPICS,
  getTimelineFeed,
  type FeedTopic,
} from "@/lib/beautyTimelineFeed";
import { loadTimeline } from "@/lib/storage";
import type { TimelineEntry } from "@/lib/types";

type MainTab = "foundation" | "more" | "feed" | "history";

function ElementDetailCard({
  item,
  isMine,
}: {
  item: ElementItem;
  isMine: boolean;
}) {
  return (
    <Card className={isMine ? "ring-2 ring-[var(--rose-dark)]/40" : ""}>
      <Tag>
        {ELEMENT_CATEGORIES.find((c) => c.id === item.categoryId)?.label}
      </Tag>
      <h3 className="font-display mt-2 text-xl font-semibold">{item.name}</h3>
      {isMine && (
        <span className="mt-1 inline-block text-[10px] font-bold text-[var(--rose-dark)]">
          あなたの診断
        </span>
      )}
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
          <p className="mt-3 text-xs font-bold text-[var(--muted)]">避けた方がよい</p>
          <ul className="mt-1 text-sm text-[var(--muted)]">
            {item.avoid.map((a) => (
              <li key={a}>· {a}</li>
            ))}
          </ul>
        </>
      )}
    </Card>
  );
}

export default function TimelinePage() {
  const { profile } = useProfile();
  const searchParams = useSearchParams();
  const hasDiagnosis = Boolean(profile);
  const [mainTab, setMainTab] = useState<MainTab>("foundation");
  const [foundationCategory, setFoundationCategory] =
    useState<ElementCategoryId | null>(null);
  const [extendedCategory, setExtendedCategory] =
    useState<ElementCategoryId | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [history, setHistory] = useState<TimelineEntry[]>([]);
  const [feedTopic, setFeedTopic] = useState<FeedTopic>("all");
  const [feedRelatedOnly, setFeedRelatedOnly] = useState(true);
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);

  useEffect(() => {
    setHistory(loadTimeline());
  }, [profile]);

  useEffect(() => {
    const tab = searchParams.get("tab");
    const q = searchParams.get("q");
    const topic = searchParams.get("topic");
    const related = searchParams.get("related");

    if (tab === "foundation" || tab === "more" || tab === "feed" || tab === "history") {
      if (tab === "more" && !hasDiagnosis) return;
      setMainTab(tab);
    }
    if (q) setSearchQuery(q);
    if (
      topic &&
      ["all", "ヘア", "メイク", "ファッション", "スキンケア", "マインド"].includes(topic)
    ) {
      setFeedTopic(topic as FeedTopic);
    }
    if (related === "1") setFeedRelatedOnly(true);
    if (related === "0") setFeedRelatedOnly(false);
  }, [searchParams, hasDiagnosis]);

  const myTags = profile ? getProfileElementTags(profile) : [];

  const foundationItems = useMemo(() => {
    if (!foundationCategory) return [];
    return getItemsByCategory(foundationCategory);
  }, [foundationCategory]);

  const extendedItems = useMemo(() => {
    if (searchQuery.trim()) {
      return searchElements(searchQuery, "extended");
    }
    if (!extendedCategory) return [];
    return getItemsByCategory(extendedCategory);
  }, [extendedCategory, searchQuery]);

  const feedPosts = useMemo(
    () => getTimelineFeed(profile, feedTopic, feedRelatedOnly),
    [profile, feedTopic, feedRelatedOnly]
  );
  const feedKeyword = searchQuery.trim();
  const filteredFeedPosts = useMemo(() => {
    if (!feedKeyword) return feedPosts;
    const kw = feedKeyword.toLowerCase();
    return feedPosts.filter((p) =>
      [p.title, p.body, p.author, ...p.tags, ...p.topics].join(" ").toLowerCase().includes(kw)
    );
  }, [feedPosts, feedKeyword]);

  const openFoundation = (catId: ElementCategoryId) => {
    setMainTab("foundation");
    setFoundationCategory(catId);
  };

  return (
    <div className="space-y-5">
      <SectionTitle sub="Timeline" title="美容タイムライン" />
      <p className="-mt-2 text-sm text-[var(--muted)]">
        まず基礎の4要素を学び、診断後に深掘り検索と着せ替えプレビューが使えます。
      </p>

      {!hasDiagnosis && (
        <Card className="border border-[var(--rose-light)]/50 bg-[var(--cream)]/50">
          <p className="text-sm font-bold text-[var(--ink)]">診断前</p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            パーソナルカラー・骨格・顔タイプ・動物顔の基礎を読めます。診断後は「追加で調べる」と着せ替えプレビューが解放されます。
          </p>
          <Link
            href="/app/scan"
            className="mt-3 inline-block rounded-full bg-[var(--ink)] px-4 py-2 text-xs font-bold text-white"
          >
            顔写真で診断する
          </Link>
        </Card>
      )}

      {hasDiagnosis && mainTab === "foundation" && (
        <Card>
          <p className="text-xs font-bold text-[var(--rose-dark)]">あなたの診断（基礎）</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {myTags
              .filter((t) =>
                ["personalColor", "bone", "faceType", "animal"].includes(t.categoryId)
              )
              .map((t) => (
                <button
                  key={`${t.categoryId}-${t.name}`}
                  type="button"
                  onClick={() => openFoundation(t.categoryId)}
                  className="rounded-full bg-[var(--rose-dark)] px-3 py-1 text-xs font-bold text-white"
                >
                  {t.name}
                </button>
              ))}
          </div>
          <Link
            href="/app/simulate"
            className="mt-4 flex items-center justify-between rounded-xl bg-gradient-to-r from-[var(--rose-dark)] to-[var(--rose)] px-4 py-3 text-sm font-bold text-white"
          >
            <span>シミュレーションで自分を見る</span>
            <span>→</span>
          </Link>
        </Card>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => {
            setMainTab("foundation");
            setSearchQuery("");
          }}
          className={`flex-1 rounded-xl py-2 text-xs font-bold ${
            mainTab === "foundation"
              ? "bg-[var(--ink)] text-white"
              : "bg-white ring-1 ring-[var(--rose-light)]/40"
          }`}
        >
          基礎を学ぶ
        </button>
        <button
          type="button"
          disabled={!hasDiagnosis}
          onClick={() => hasDiagnosis && setMainTab("more")}
          className={`flex-1 rounded-xl py-2 text-xs font-bold ${
            mainTab === "more"
              ? "bg-[var(--ink)] text-white"
              : !hasDiagnosis
                ? "bg-[var(--cream)] text-[var(--muted)]"
                : "bg-white ring-1 ring-[var(--rose-light)]/40"
          }`}
        >
          追加で調べる
          {!hasDiagnosis && (
            <span className="mt-0.5 block text-[9px] font-normal">診断後</span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setMainTab("feed")}
          className={`flex-1 rounded-xl py-2 text-xs font-bold ${
            mainTab === "feed"
              ? "bg-[var(--ink)] text-white"
              : "bg-white ring-1 ring-[var(--rose-light)]/40"
          }`}
        >
          美容SNS
        </button>
        <button
          type="button"
          onClick={() => setMainTab("history")}
          className={`flex-1 rounded-xl py-2 text-xs font-bold ${
            mainTab === "history"
              ? "bg-[var(--ink)] text-white"
              : "bg-white ring-1 ring-[var(--rose-light)]/40"
          }`}
        >
          記録
        </button>
      </div>

      {mainTab === "foundation" && (
        <>
          {!foundationCategory ? (
            <div className="space-y-3">
              <p className="text-xs font-bold text-[var(--ink)]">
                基礎の4要素 — カテゴリを選んでください
              </p>
              {FOUNDATION_CATEGORIES.map((cat) => {
                const count = getItemsByCategory(cat.id).length;
                const mine = myTags.find((t) => t.categoryId === cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setFoundationCategory(cat.id)}
                    className="card-hover w-full rounded-2xl bg-white p-4 text-left ring-1 ring-[var(--rose-light)]/25"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-display text-lg font-semibold">{cat.label}</p>
                      <span className="text-xs text-[var(--muted)]">{count}項目</span>
                    </div>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      {cat.id === "personalColor" && "似合う色・メイクの方向性"}
                      {cat.id === "bone" && "似合う服のシルエット"}
                      {cat.id === "faceType" && "似合うヘア・メイクの雰囲気"}
                      {cat.id === "animal" && "顔の印象・キャラクター性"}
                    </p>
                    {mine && (
                      <p className="mt-2 text-xs font-bold text-[var(--rose-dark)]">
                        診断: {mine.name}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setFoundationCategory(null)}
                className="text-xs font-bold text-[var(--rose-dark)]"
              >
                ← 基礎カテゴリ一覧に戻る
              </button>
              <p className="text-sm font-bold">
                {
                  FOUNDATION_CATEGORIES.find((c) => c.id === foundationCategory)
                    ?.label
                }
              </p>
              <div className="space-y-3">
                {foundationItems.map((item) => (
                  <ElementDetailCard
                    key={item.id}
                    item={item}
                    isMine={myTags.some(
                      (t) => t.name === item.name && t.categoryId === item.categoryId
                    )}
                  />
                ))}
              </div>
            </>
          )}
        </>
      )}

      {mainTab === "more" && hasDiagnosis && (
        <>
          <Card className="p-3">
            <label className="text-xs font-bold text-[var(--ink)]">
              キーワードで検索
            </label>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value.trim()) setExtendedCategory(null);
              }}
              placeholder="例: 韓国、前髪、透明感…"
              className="mt-2 w-full rounded-xl border border-[var(--rose-light)]/50 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--rose-dark)]/30"
            />
            <p className="mt-2 text-[10px] text-[var(--muted)]">
              第一印象・美容系統・魅力・垢抜けの中から探します
            </p>
          </Card>

          {!searchQuery.trim() && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {EXTENDED_CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setExtendedCategory(c.id)}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold ${
                    extendedCategory === c.id
                      ? "bg-[var(--rose-dark)] text-white"
                      : "bg-white text-[var(--muted)] ring-1 ring-[var(--rose-light)]/40"
                  }`}
                >
                  {c.short}
                </button>
              ))}
            </div>
          )}

          {searchQuery.trim() && (
            <p className="text-xs text-[var(--muted)]">
              「{searchQuery}」の検索結果（{extendedItems.length}件）
            </p>
          )}

          {!searchQuery.trim() && !extendedCategory && (
            <Card>
              <p className="text-sm text-[var(--muted)]">
                カテゴリを選ぶか、上の検索欄にキーワードを入力してください。
              </p>
            </Card>
          )}

          {(searchQuery.trim() || extendedCategory) && (
            <div className="space-y-3">
              {extendedItems.length === 0 && (
                <Card>
                  <p className="text-sm text-[var(--muted)]">
                    該当する項目がありません。別のキーワードをお試しください。
                  </p>
                </Card>
              )}
              {extendedItems.map((item) => (
                <ElementDetailCard
                  key={item.id}
                  item={item}
                  isMine={myTags.some(
                    (t) => t.name === item.name && t.categoryId === item.categoryId
                  )}
                />
              ))}
            </div>
          )}

          <Link
            href="/app/simulate"
            className="block rounded-xl border-2 border-dashed border-[var(--rose-dark)]/40 py-3 text-center text-sm font-bold text-[var(--rose-dark)]"
          >
            シミュレーションへ →
          </Link>
        </>
      )}

      {mainTab === "more" && !hasDiagnosis && (
        <Card>
          <p className="text-sm text-[var(--muted)]">
            追加検索は診断後に利用できます。まず基礎を学ぶか、診断を完了してください。
          </p>
          <Link
            href="/app/scan"
            className="mt-3 inline-block text-sm font-bold text-[var(--rose-dark)]"
          >
            診断する →
          </Link>
        </Card>
      )}

      {mainTab === "feed" && (
        <div className="space-y-3">
          <Card className="p-3">
            <p className="text-sm font-bold text-[var(--ink)]">美容専用タイムライン</p>
            <p className="mt-1 text-xs text-[var(--muted)]">
              自分の系統に合う投稿だけ表示できます。気になる話題だけ選んでチェック。
            </p>
            <div className="mt-3 flex items-center justify-between rounded-xl bg-[var(--cream)] px-3 py-2">
              <p className="text-xs font-semibold text-[var(--ink)]">関連情報だけ表示</p>
              <button
                type="button"
                onClick={() => setFeedRelatedOnly((v) => !v)}
                className={`rounded-full px-3 py-1 text-[10px] font-bold ${
                  feedRelatedOnly
                    ? "bg-[var(--rose-dark)] text-white"
                    : "bg-white text-[var(--muted)] ring-1 ring-[var(--rose-light)]/40"
                }`}
              >
                {feedRelatedOnly ? "ON" : "OFF"}
              </button>
            </div>
            {!profile && (
              <p className="mt-2 text-[10px] text-[var(--muted)]">
                ※ 診断後は「あなた向け」がより正確になります
              </p>
            )}
          </Card>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {FEED_TOPICS.map((topic) => (
              <button
                key={topic}
                type="button"
                onClick={() => setFeedTopic(topic)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold ${
                  feedTopic === topic
                    ? "bg-[var(--rose-dark)] text-white"
                    : "bg-white text-[var(--muted)] ring-1 ring-[var(--rose-light)]/40"
                }`}
              >
                {topic === "all" ? "すべて" : topic}
              </button>
            ))}
          </div>
          <Card className="p-3">
            <label className="text-xs font-bold text-[var(--ink)]">投稿を検索</label>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="例: 前髪、透明感、石原さとみ"
              className="mt-2 w-full rounded-xl border border-[var(--rose-light)]/50 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--rose-dark)]/30"
            />
            <p className="mt-2 text-[10px] text-[var(--muted)]">
              表示中: {filteredFeedPosts.length}件
              {feedRelatedOnly ? "（あなた向けのみ）" : ""}
            </p>
          </Card>

          {filteredFeedPosts.length === 0 && (
            <Card>
              <p className="text-sm text-[var(--muted)]">
                条件に合う投稿がありません。トピックを「すべて」にするか、
                「関連情報だけ」をOFFにしてください。
              </p>
            </Card>
          )}

          {filteredFeedPosts.map((post) => (
            <Card key={post.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 gap-2">
                  <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--cream)] text-[10px] font-bold text-[var(--rose-dark)]">
                    {post.author.slice(0, 1).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-xs text-[var(--muted)]">@{post.author}</p>
                    <h3 className="mt-1 font-display text-lg font-semibold leading-snug">
                      {post.title}
                    </h3>
                  </div>
                </div>
                <span className="shrink-0 text-[10px] font-semibold text-[var(--muted)]">
                  {post.publishedAt}
                </span>
              </div>
              <p
                className={`mt-2 text-sm leading-relaxed text-[var(--ink)] ${
                  expandedPostId === post.id ? "" : "line-clamp-3"
                }`}
              >
                {post.body}
              </p>
              <button
                type="button"
                onClick={() =>
                  setExpandedPostId((prev) => (prev === post.id ? null : post.id))
                }
                className="mt-1 text-[11px] font-bold text-[var(--rose-dark)]"
              >
                {expandedPostId === post.id ? "閉じる" : "続きを読む"}
              </button>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {post.topics.map((topic) => (
                  <Tag key={`${post.id}-${topic}`}>{topic}</Tag>
                ))}
                {post.tags.map((tag) => (
                  <Tag key={`${post.id}-${tag}`}>#{tag}</Tag>
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-[var(--cream)] pt-2 text-[10px] text-[var(--muted)]">
                <span>参考情報</span>
                <span>保存 · 共有</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {mainTab === "history" && (
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
          {history.map((e) => (
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
                    onClick={() => openFoundation("personalColor")}
                  >
                    <Tag>{e.personalColor}</Tag>
                  </button>
                  <button type="button" onClick={() => openFoundation("bone")}>
                    <Tag>{e.boneStructure}</Tag>
                  </button>
                  <button
                    type="button"
                    onClick={() => openFoundation("faceType")}
                  >
                    <Tag>{e.faceType}</Tag>
                  </button>
                  <button type="button" onClick={() => openFoundation("animal")}>
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
