export type SkinType = "乾燥肌" | "脂性肌" | "混合肌" | "敏感肌";
export type SkinCondition = "赤み" | "くすみ" | "黄ぐすみ" | "毛穴";
export type SkinConcern = "しわ" | "ニキビ" | "しみ" | "美白" | "保湿" | "毛穴";

export type PersonalColor =
  | "イエベ春"
  | "イエベ秋"
  | "ブルベ夏"
  | "ブルベ冬";

export type ProductArea = "skincare" | "makeup" | "fashion";

export type ProductCategory =
  | "クレンジング"
  | "洗顔"
  | "化粧水"
  | "美容液"
  | "乳液"
  | "クリーム"
  | "日焼け止め"
  | "ファンデ"
  | "コンシーラー"
  | "チーク"
  | "アイメイク"
  | "リップ"
  | "トップス"
  | "ボトムス"
  | "アウター"
  | "アクセサリー";

export interface BeautyPreferences {
  age: number;
  monthlyBudget: number;
  /** カテゴリ別予算を自分で指定する */
  useCustomBudget: boolean;
  budgetSkincare: number;
  budgetMakeup: number;
  budgetFashion: number;
  skinTypes: SkinType[];
  skinConditions: SkinCondition[];
  concerns: SkinConcern[];
  personalColor: PersonalColor | null;
  updatedAt: string;
}

export interface ProductRecommendation {
  id: string;
  name: string;
  brand: string;
  price: number;
  category: ProductCategory;
  area: ProductArea;
  description: string;
  reason: string;
  tags: string[];
}

export interface RecommendationPlan {
  preferences: BeautyPreferences;
  skincare: ProductRecommendation[];
  makeup: ProductRecommendation[];
  fashion: ProductRecommendation[];
  skincareTotal: number;
  makeupTotal: number;
  fashionTotal: number;
  grandTotal: number;
  remainingBudget: number;
  summary: string;
}

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

export interface UserPhoto {
  id: string;
  url: string;
  label: string;
  addedAt: string;
  analyzedAt?: string;
}

export interface BeautyProfile {
  id: string;
  photoUrl: string | null;
  /** 登録した顔写真（複数可） */
  photos?: UserPhoto[];
  /** シミュレーション等で使う選択中の写真 */
  activePhotoId?: string | null;
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
