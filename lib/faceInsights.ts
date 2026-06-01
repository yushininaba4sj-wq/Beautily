import type { BeautyProfile, FaceCharm } from "./types";

export type CharmMetric = {
  key: keyof FaceCharm;
  label: string;
  description: string;
  tip: string;
};

export const CHARM_METRICS: CharmMetric[] = [
  {
    key: "eyePower",
    label: "目力",
    description: "目元の存在感・印象の強さ",
    tip: "涙袋とマスカラのバランスで調整しやすい項目です。",
  },
  {
    key: "contour",
    label: "輪郭",
    description: "フェイスラインの整い・立体感",
    tip: "ヘアのレイヤーと頬の影の入れ方で印象が変わります。",
  },
  {
    key: "profile",
    label: "横顔",
    description: "Eライン・鼻・顎のバランス",
    tip: "前髪と眉の角度で横顔の印象を整えられます。",
  },
  {
    key: "noseLine",
    label: "鼻筋",
    description: "鼻の通り・面長バランス",
    tip: "ハイライトの位置で立体感をコントロールできます。",
  },
  {
    key: "clarity",
    label: "透明感",
    description: "肌の清潔感・色ムラの少なさ",
    tip: "ベースメイクと髪色のトーンが鍵になります。",
  },
  {
    key: "balance",
    label: "バランス",
    description: "パーツ全体の調和・左右の均整",
    tip: "眉・チーク・リップの位置で完成度が上がります。",
  },
];

function toDeviation(score: number): number {
  return Math.round(Math.min(76, Math.max(44, 50 + (score - 72) * 0.85)) * 10) / 10;
}

export type FaceDeviationInsight = {
  overall: number;
  rankLabel: string;
  summary: string;
  metrics: {
    label: string;
    score: number;
    deviation: number;
    description: string;
    tip: string;
  }[];
};

export function getFaceDeviationInsight(charm: FaceCharm): FaceDeviationInsight {
  const scores = CHARM_METRICS.map((m) => charm[m.key]);
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  const overall = toDeviation(avg);

  let rankLabel = "平均付近";
  let summary = "バランスの取れた印象。メイクとヘアでさらに伸ばせます。";
  if (overall >= 65) {
    rankLabel = "上位15%";
    summary = "全体的に高水準。強みを活かすメイクでさらに印象が際立ちます。";
  } else if (overall >= 60) {
    rankLabel = "上位25%";
    summary = "魅力的なベース。パーツごとの微調整で完成度が大きく上がります。";
  } else if (overall >= 55) {
    rankLabel = "平均以上";
    summary = "土台は良好。垢抜けの優先ポイントを押さえると一気に変わります。";
  } else if (overall < 50) {
    rankLabel = "伸びしろ大";
    summary = "改善余地が大きいタイプ。眉毛・前髪・髪色から手を付けると効果的です。";
  }

  const metrics = CHARM_METRICS.map((m) => ({
    label: m.label,
    score: charm[m.key],
    deviation: toDeviation(charm[m.key]),
    description: m.description,
    tip: m.tip,
  })).sort((a, b) => b.deviation - a.deviation);

  return { overall, rankLabel, summary, metrics };
}

export type CelebrityMatch = {
  name: string;
  similarityPercent: number;
  impression: string;
  sharedTraits: string[];
  styleReference: string;
};

const CELEBRITY_NOTES: Record<string, { impression: string; baseTraits: string[] }> = {
  石原さとみ: {
    impression: "親しみやすく上品なナチュラル美人",
    baseTraits: ["柔らかい笑顔", "ナチュラルな目元", "血色感のあるリップ"],
  },
  中村アン: {
    impression: "モードと可愛さのミックス",
    baseTraits: ["シャープな目元", "きれいめシルエット", "抜け感のある前髪"],
  },
  "TWICE サナ": {
    impression: "華やかで韓国きれいめな印象",
    baseTraits: ["ぱっちり目", "透明感肌", "グラデーションリップ"],
  },
  新垣結衣: {
    impression: "清楚で透明感のある王道美人",
    baseTraits: ["穏やかな目元", "ソフトな輪郭", "自然な笑顔"],
  },
  本田翼: {
    impression: "フレッシュで親しみやすい",
    baseTraits: ["明るい表情", "軽やかなヘア", "カジュアルな可愛さ"],
  },
  橋本環奈: {
    impression: "華奢で可愛らしい印象",
    baseTraits: ["大きな目", "コンパクトな顔立ち", "甘めのリップ"],
  },
};

export function getCelebrityMatches(profile: BeautyProfile): CelebrityMatch[] {
  const seed = profile.faceType.length + profile.animalFace.length;

  return profile.celebrities.map((name, index) => {
    const base = CELEBRITY_NOTES[name] ?? {
      impression: "雰囲気が近いタイプ",
      baseTraits: ["パーツのバランス", "全体の印象"],
    };
    const similarityPercent = Math.min(
      94,
      78 + ((seed + index * 7) % 14)
    );
    const sharedTraits = [
      `${profile.faceType}系の雰囲気`,
      `${profile.animalFace}の柔らかさ`,
      ...base.baseTraits.slice(0, 2),
    ];
    return {
      name,
      similarityPercent,
      impression: base.impression,
      sharedTraits,
      styleReference: `${profile.matchingStyles[0] ?? "きれいめ"}系のメイク・${profile.hairStyle[0] ?? "レイヤー"}ヘアが参考になります。`,
    };
  });
}
