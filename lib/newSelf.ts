import type { BeautyProfile } from "./types";
import { getFaceDeviationInsight } from "./faceInsights";

export type JourneyStep = {
  id: string;
  label: string;
  desc: string;
  href: string;
  done: boolean;
};

export type NewSelfPersona = {
  id: string;
  emoji: string;
  title: string;
  tagline: string;
  hairColor: string;
  hairStyle: string;
  makeup: string;
  fashion: string;
  vibeWords: string[];
  oneLiner: string;
};

export function getTransformationJourney(profile: BeautyProfile | null): JourneyStep[] {
  const hasProfile = Boolean(profile);
  return [
    {
      id: "know",
      label: "自分を知る",
      desc: "顔タイプ・骨格・魅力を分析",
      href: "/app/scan",
      done: hasProfile,
    },
    {
      id: "discover",
      label: "可能性を見つける",
      desc: "3つの「新しい私」を提案",
      href: "/app/discover",
      done: hasProfile,
    },
    {
      id: "try",
      label: "変化を試す",
      desc: "髪・メイク・服をプレビュー",
      href: "/app/simulate",
      done: hasProfile,
    },
    {
      id: "finish",
      label: "完成形へ",
      desc: "垢抜けロードマップで伴走",
      href: "/app/roadmap",
      done: hasProfile,
    },
  ];
}

export function getGlowPotential(profile: BeautyProfile): {
  percent: number;
  label: string;
  message: string;
} {
  const insight = getFaceDeviationInsight(profile.charm);
  const room = Math.round(Math.min(38, Math.max(12, 72 - insight.overall + 18)));
  return {
    percent: room,
    label: room >= 28 ? "伸びしろMAX" : room >= 20 ? "伸びしろあり" : "さらに磨ける",
    message: `今のあなたは${insight.rankLabel}。メイク・髪・服を整えると、まだ${room}%分「新しい私」に近づけます。`,
  };
}

export function getNewSelfPersonas(profile: BeautyProfile): NewSelfPersona[] {
  const styleA = profile.matchingStyles[0] || "韓国きれいめ";
  const styleB = profile.beautyStyles[0] || "女優系";
  const styleC = profile.beautyStyles[1] || profile.firstImpressions[0] || "清楚系";

  return [
    {
      id: "persona-kirei",
      emoji: "✨",
      title: `${styleA}な私`,
      tagline: "今いちばん似合う、王道の完成形",
      hairColor: profile.hairColor[0] || "ミルクティー",
      hairStyle: profile.hairStyle[0] || "レイヤー",
      makeup: "韓流きれいめ",
      fashion: profile.fashion[0] || "韓国きれいめ",
      vibeWords: [profile.faceType, profile.personalColor, "透明感"],
      oneLiner: `${profile.animalFace}×${profile.personalColor}の強みを活かした、垢抜け最速ルート。`,
    },
    {
      id: "persona-chic",
      emoji: "🖤",
      title: `${styleB}チャレンジ`,
      tagline: "少し大人っぽい、別の自分",
      hairColor: profile.hairColor[1] || "グレージュ",
      hairStyle: profile.hairStyle[1] || "ロング",
      makeup: "大人っぽい",
      fashion: profile.fashion[1] || "モード",
      vibeWords: ["洗練", profile.boneStructure, "抜け感"],
      oneLiner: "いつもと違う印象に挑戦したい日の、セカンドペルソナ。",
    },
    {
      id: "persona-soft",
      emoji: "🌸",
      title: `${styleC}な私`,
      tagline: "柔らかく可愛い、隠れた一面",
      hairColor: profile.hairColor[2] || "ピンクブラウン",
      hairStyle: "前髪あり",
      makeup: "ガーリー",
      fashion: profile.fashion[2] || "フェミニン",
      vibeWords: [profile.animalFace, "血色感", "親しみ"],
      oneLiner: "デートや女子会で「雰囲気変わった？」と言われるタイプ。",
    },
  ];
}

export function getVisionMessage(profile: BeautyProfile | null): string {
  if (!profile) {
    return "顔写真ひとつで、まだ出会っていない「新しい私」が見つかる。診断からはじめよう。";
  }
  return `${profile.faceType}・${profile.animalFace}のあなたには、${profile.matchingStyles.slice(0, 2).join("と")}の可能性がある。鏡の前で試して、本当に似合う完成形を見つけよう。`;
}
