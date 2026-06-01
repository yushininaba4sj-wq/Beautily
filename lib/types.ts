export type PersonalColor =
  | "イエベ春"
  | "イエベ秋"
  | "ブルベ夏"
  | "ブルベ冬";

export type BoneStructure = "ストレート" | "ウェーブ" | "ナチュラル";

export type FaceType =
  | "キュート"
  | "フレッシュ"
  | "フェミニン"
  | "ソフトエレガント"
  | "エレガント"
  | "クール";

export type AnimalFace = "猫顔" | "犬顔" | "狐顔" | "鹿顔" | "うさぎ顔";

export type FirstImpression =
  | "可愛い系"
  | "美人系"
  | "清楚系"
  | "クール系"
  | "親しみやすい系"
  | "知的系";

export type BeautyStyle =
  | "韓国スター系"
  | "女優系"
  | "モデル系"
  | "フレンチガーリー系"
  | "お姉さん系"
  | "淡色女子系";

export interface FaceCharm {
  eyePower: number;
  contour: number;
  profile: number;
  noseLine: number;
  clarity: number;
  balance: number;
}

export interface GlowUpTip {
  area: string;
  priority: number;
  advice: string;
}

export interface BeautyProfile {
  id: string;
  photoUrl: string | null;
  analyzedAt: string;
  personalColor: PersonalColor;
  boneStructure: BoneStructure;
  faceType: FaceType;
  animalFace: AnimalFace;
  firstImpressions: FirstImpression[];
  beautyStyles: BeautyStyle[];
  charm: FaceCharm;
  glowUpTips: GlowUpTip[];
  impressions: string[];
  matchingStyles: string[];
  celebrities: string[];
  roadmap: { step: number; title: string; detail: string }[];
  makeup: Record<string, string[]>;
  hairStyle: string[];
  hairColor: string[];
  fashion: string[];
  accessories: string[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  imageUrl?: string;
  at: string;
}

export interface ClosetItem {
  id: string;
  name: string;
  category: string;
}

export interface CosmeticItem {
  id: string;
  name: string;
  category: string;
}

export interface TimelineEntry {
  id: string;
  profileId: string;
  analyzedAt: string;
  label: string;
  personalColor: string;
  boneStructure: string;
  faceType: string;
  animalFace: string;
  photoUrl: string | null;
}
