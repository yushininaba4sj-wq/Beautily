export type LookCategory = "hairColor" | "hairStyle" | "makeup" | "fashion" | "finish";

export type HairStyleEffect = "bangs" | "no-bangs" | "bob" | "long" | "layer";

export type LookPreset = {
  id: string;
  category: LookCategory;
  name: string;
  hairTint?: { hex: string; strength: number };
  hairStyleEffect?: HairStyleEffect;
  makeup?: {
    lipHex: string;
    cheekHex: string;
    eyeHex?: string;
    strength: number;
    cheekHeight?: number;
  };
  fashionOverlay?: {
    topHex: string;
    accentHex?: string;
    strength: number;
  };
  filter?: {
    brightness?: number;
    contrast?: number;
    saturate?: number;
    warmth?: number;
  };
};

export const HAIR_COLOR_PRESETS: LookPreset[] = [
  { id: "hc-milk", category: "hairColor", name: "ミルクティー", hairTint: { hex: "#e8dcc8", strength: 0.88 } },
  { id: "hc-greige", category: "hairColor", name: "グレージュ", hairTint: { hex: "#8a8278", strength: 0.9 } },
  { id: "hc-pink", category: "hairColor", name: "ピンクブラウン", hairTint: { hex: "#c87868", strength: 0.85 } },
  { id: "hc-lavender", category: "hairColor", name: "ラベンダー", hairTint: { hex: "#a898c8", strength: 0.82 } },
  { id: "hc-black", category: "hairColor", name: "黒髪", hairTint: { hex: "#1a1614", strength: 0.92 } },
  { id: "hc-ash", category: "hairColor", name: "アッシュ", hairTint: { hex: "#788088", strength: 0.86 } },
  { id: "hc-honey", category: "hairColor", name: "ハニーブロンド", hairTint: { hex: "#d4a860", strength: 0.84 } },
];

export const HAIR_STYLE_PRESETS: LookPreset[] = [
  {
    id: "hs-bob",
    category: "hairStyle",
    name: "ボブ",
    hairStyleEffect: "bob",
    hairTint: { hex: "#b0a090", strength: 0.5 },
    filter: { contrast: 1.08, saturate: 1.05 },
  },
  {
    id: "hs-long",
    category: "hairStyle",
    name: "ロング",
    hairStyleEffect: "long",
    hairTint: { hex: "#9a8a7a", strength: 0.45 },
    filter: { brightness: 1.02, saturate: 1.08 },
  },
  {
    id: "hs-layer",
    category: "hairStyle",
    name: "レイヤー",
    hairStyleEffect: "layer",
    hairTint: { hex: "#c8b8a8", strength: 0.55 },
    filter: { contrast: 1.1 },
  },
  {
    id: "hs-bangs",
    category: "hairStyle",
    name: "前髪あり",
    hairStyleEffect: "bangs",
    hairTint: { hex: "#2a2420", strength: 0.65 },
  },
  {
    id: "hs-nobangs",
    category: "hairStyle",
    name: "前髪なし",
    hairStyleEffect: "no-bangs",
    filter: { brightness: 1.06, contrast: 1.04 },
  },
];

export const MAKEUP_PRESETS: LookPreset[] = [
  {
    id: "mk-korea",
    category: "makeup",
    name: "韓流きれいめ",
    makeup: {
      lipHex: "#e87878",
      cheekHex: "#f8a0a0",
      eyeHex: "#d8a0a8",
      strength: 0.72,
      cheekHeight: 0.44,
    },
    filter: { brightness: 1.08, saturate: 1.12 },
  },
  {
    id: "mk-clear",
    category: "makeup",
    name: "清楚系",
    makeup: {
      lipHex: "#d88898",
      cheekHex: "#ffc8c8",
      eyeHex: "#e8c0c8",
      strength: 0.65,
      cheekHeight: 0.43,
    },
    filter: { brightness: 1.1, contrast: 0.96 },
  },
  {
    id: "mk-actress",
    category: "makeup",
    name: "女優系",
    makeup: {
      lipHex: "#a84858",
      cheekHex: "#d08080",
      eyeHex: "#b88888",
      strength: 0.68,
      cheekHeight: 0.45,
    },
    filter: { contrast: 1.08, warmth: 0.1 },
  },
  {
    id: "mk-mature",
    category: "makeup",
    name: "大人っぽい",
    makeup: {
      lipHex: "#8a3848",
      cheekHex: "#c07070",
      eyeHex: "#987070",
      strength: 0.62,
      cheekHeight: 0.46,
    },
    filter: { contrast: 1.12, saturate: 0.98 },
  },
  {
    id: "mk-girly",
    category: "makeup",
    name: "ガーリー",
    makeup: {
      lipHex: "#f06888",
      cheekHex: "#ffa8b8",
      eyeHex: "#f8a0b0",
      strength: 0.78,
      cheekHeight: 0.42,
    },
    filter: { brightness: 1.06, saturate: 1.15 },
  },
];

export const FASHION_PRESETS: LookPreset[] = [
  {
    id: "fa-korea",
    category: "fashion",
    name: "韓国きれいめ",
    fashionOverlay: { topHex: "#f0e8e8", accentHex: "#c8a0a0", strength: 0.72 },
    makeup: { lipHex: "#e08080", cheekHex: "#f0a8a8", strength: 0.55, cheekHeight: 0.44 },
    filter: { brightness: 1.04, saturate: 1.1 },
  },
  {
    id: "fa-feminine",
    category: "fashion",
    name: "フェミニン",
    fashionOverlay: { topHex: "#f8d8e0", accentHex: "#e8a0b0", strength: 0.75 },
    makeup: { lipHex: "#e07090", cheekHex: "#f8b0c0", strength: 0.6, cheekHeight: 0.43 },
  },
  {
    id: "fa-pale",
    category: "fashion",
    name: "淡色女子",
    fashionOverlay: { topHex: "#f8f0f8", accentHex: "#e8d0e8", strength: 0.7 },
    makeup: { lipHex: "#e8b0c8", cheekHex: "#ffe0e8", strength: 0.5, cheekHeight: 0.42 },
    filter: { brightness: 1.08, saturate: 0.95 },
  },
  {
    id: "fa-mode",
    category: "fashion",
    name: "モード",
    fashionOverlay: { topHex: "#2a2830", accentHex: "#1a1818", strength: 0.78 },
    makeup: { lipHex: "#8a4858", cheekHex: "#a07078", strength: 0.45, cheekHeight: 0.46 },
    filter: { contrast: 1.15, saturate: 0.9, brightness: 0.96 },
  },
  {
    id: "fa-casual",
    category: "fashion",
    name: "カジュアル",
    fashionOverlay: { topHex: "#d8e8f0", accentHex: "#a8c8d8", strength: 0.68 },
    filter: { brightness: 1.05, saturate: 1.05, warmth: 0.06 },
  },
  {
    id: "fa-neat",
    category: "fashion",
    name: "きれいめ",
    fashionOverlay: { topHex: "#f0ece8", accentHex: "#d8c8c0", strength: 0.7 },
    makeup: { lipHex: "#c87078", cheekHex: "#e8a0a0", strength: 0.52, cheekHeight: 0.44 },
    filter: { contrast: 1.06, brightness: 1.04 },
  },
];

export function presetsForCategory(cat: LookCategory): LookPreset[] {
  switch (cat) {
    case "hairColor":
      return HAIR_COLOR_PRESETS;
    case "hairStyle":
      return HAIR_STYLE_PRESETS;
    case "makeup":
      return MAKEUP_PRESETS;
    case "fashion":
      return FASHION_PRESETS;
    default:
      return [];
  }
}

export function buildFinishPreset(
  hairColorName: string,
  makeupName: string,
  fashionName: string
): LookPreset {
  const hc = HAIR_COLOR_PRESETS.find((p) => p.name === hairColorName) || HAIR_COLOR_PRESETS[0];
  const mk = MAKEUP_PRESETS.find((p) => p.name === makeupName) || MAKEUP_PRESETS[0];
  const fa = FASHION_PRESETS.find((p) => p.name === fashionName) || FASHION_PRESETS[0];
  return {
    id: "finish-custom",
    category: "finish",
    name: "あなたの完成形",
    hairTint: hc.hairTint,
    hairStyleEffect: "layer",
    makeup: mk.makeup || fa.makeup,
    fashionOverlay: fa.fashionOverlay,
    filter: {
      brightness: (mk.filter?.brightness || 1) * (fa.filter?.brightness || 1),
      contrast: ((mk.filter?.contrast || 1) + (fa.filter?.contrast || 1)) / 2,
      saturate: ((mk.filter?.saturate || 1) + (fa.filter?.saturate || 1)) / 2,
      warmth: (mk.filter?.warmth || 0) + (fa.filter?.warmth || 0),
    },
  };
}
