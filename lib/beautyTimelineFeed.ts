import type { BeautyProfile } from "./types";

export type FeedTopic =
  | "all"
  | "ヘア"
  | "メイク"
  | "ファッション"
  | "スキンケア"
  | "マインド";

export type BeautyFeedPost = {
  id: string;
  title: string;
  author: string;
  body: string;
  topics: FeedTopic[];
  tags: string[];
  publishedAt: string;
  personalColors?: string[];
  faceTypes?: string[];
  styles?: string[];
  firstImpressions?: string[];
};

export const FEED_TOPICS: FeedTopic[] = [
  "all",
  "ヘア",
  "メイク",
  "ファッション",
  "スキンケア",
  "マインド",
];

const FEED_POSTS: BeautyFeedPost[] = [
  {
    id: "feed_1",
    title: "透明感を出すラベンダー下地の順番",
    author: "mio_beauty",
    body: "日焼け止め→ラベンダー下地→クッションの順で重ねると、白浮きせずにトーンアップ。首にも薄く伸ばすと写真で差が出ます。",
    topics: ["メイク", "スキンケア"],
    tags: ["透明感", "ベースメイク"],
    publishedAt: "2分前",
    personalColors: ["ブルベ夏", "ブルベ冬"],
    firstImpressions: ["清楚系", "知的系"],
  },
  {
    id: "feed_2",
    title: "猫顔さん向け 前髪ありボブの黄金バランス",
    author: "rina_hair",
    body: "目の上ギリのシースルー前髪 + 顎下1cmボブが最強。顔の余白を減らして、目元の魅力を自然に強調できます。",
    topics: ["ヘア"],
    tags: ["猫顔", "前髪", "ボブ"],
    publishedAt: "9分前",
    faceTypes: ["キュート", "フレッシュ"],
    styles: ["韓国スター系", "フレンチガーリー系"],
  },
  {
    id: "feed_3",
    title: "ウェーブ骨格の着痩せトップス3選",
    author: "nana_style",
    body: "柔らかい素材・短め丈・首元に抜け感があるデザインが相性◎。重めスウェットはインナーを見せて軽さを作るのがおすすめ。",
    topics: ["ファッション"],
    tags: ["骨格ウェーブ", "着痩せ"],
    publishedAt: "17分前",
    styles: ["淡色女子系", "フレンチガーリー系"],
  },
  {
    id: "feed_4",
    title: "イエベ春の多幸感メイク配色メモ",
    author: "yua_make",
    body: "コーラルチークを頬の高い位置に。リップはツヤ系オレンジピンク。アイシャドウは黄みベージュに細いブラウンラインで締めると今っぽい。",
    topics: ["メイク"],
    tags: ["イエベ春", "多幸感"],
    publishedAt: "25分前",
    personalColors: ["イエベ春"],
    styles: ["女優系", "韓国スター系"],
  },
  {
    id: "feed_5",
    title: "クール系でも盛れる甘さの足し方",
    author: "saki_mode",
    body: "全体はモノトーンでも、耳元にパール or リボンを一点だけ。甘さを1か所に限定するとクールさを崩さず柔らかく見えます。",
    topics: ["ファッション", "マインド"],
    tags: ["クール系", "垢抜け"],
    publishedAt: "41分前",
    firstImpressions: ["クール系", "美人系"],
    styles: ["モデル系", "お姉さん系"],
  },
  {
    id: "feed_6",
    title: "夜まで崩れにくい毛穴ケアルーティン",
    author: "emi_skin",
    body: "洗顔後に冷却パック1分→皮脂崩れ防止下地→Tゾーンだけパウダー。厚塗りせずに持ちを伸ばせます。",
    topics: ["スキンケア", "メイク"],
    tags: ["毛穴", "崩れ防止"],
    publishedAt: "58分前",
  },
  {
    id: "feed_7",
    title: "ソフトエレガント向け きれいめ巻き髪",
    author: "kana_hair",
    body: "32mmで中間からワンカール、顔まわりだけリバース。ツヤ仕上げで上品さを残すとソフトエレガントの魅力が活きます。",
    topics: ["ヘア"],
    tags: ["上品", "巻き髪"],
    publishedAt: "1時間前",
    faceTypes: ["ソフトエレガント", "エレガント"],
    styles: ["女優系", "お姉さん系"],
  },
  {
    id: "feed_8",
    title: "診断結果に振り回されない美容の続け方",
    author: "aya_journal",
    body: "診断は地図、主役はあなた。毎週1つだけ実験して、写真で比較するのが最短。小さな成功を積むと垢抜けが加速します。",
    topics: ["マインド"],
    tags: ["習慣化", "自己肯定感"],
    publishedAt: "1時間前",
  },
];

function scorePost(post: BeautyFeedPost, profile: BeautyProfile): number {
  let score = 0;
  if (post.personalColors?.includes(profile.personalColor)) score += 2;
  if (post.faceTypes?.includes(profile.faceType)) score += 2;
  if (post.styles?.some((s) => profile.beautyStyles.includes(s as never))) score += 2;
  if (
    post.firstImpressions?.some((s) =>
      profile.firstImpressions.includes(s as never)
    )
  ) {
    score += 1;
  }
  return score;
}

export function getTimelineFeed(
  profile: BeautyProfile | null,
  topic: FeedTopic,
  relatedOnly: boolean
): BeautyFeedPost[] {
  const byTopic =
    topic === "all" ? FEED_POSTS : FEED_POSTS.filter((p) => p.topics.includes(topic));

  if (!profile) {
    return relatedOnly ? [] : byTopic;
  }

  const withScore = byTopic.map((post) => ({ post, score: scorePost(post, profile) }));
  const filtered = relatedOnly ? withScore.filter((x) => x.score > 0) : withScore;

  return filtered
    .sort((a, b) => b.score - a.score)
    .map((x) => x.post);
}
