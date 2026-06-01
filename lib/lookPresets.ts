export type LookCategory = "hairColor" | "hairStyle" | "makeup" | "fashion" | "finish";

export type LookPreset = {
  id: string;
  category: LookCategory;
  name: string;
  hairTint?: { hex: string; strength: number };
  makeup?: { lipHex: string; cheekHex: string; strength: number };
  filter?: {
    brightness?: number;
    contrast?: number;
    saturate?: number;
    warmth?: number;
  };
};

export const HAIR_COLOR_PRESETS: LookPreset[] = [
  { id: "hc-milk", category: "hairColor", name: "ミルクティー", hairTint: { hex: "#d4c4b0", strength: 0.42 } },
  { id: "hc-greige", category: "hairColor", name: "グレージュ", hairTint: { hex: "#9a8f88", strength: 0.45 } },
  { id: "hc-pink", category: "hairColor", name: "ピンクブラウン", hairTint: { hex: "#c49a8f", strength: 0.4 } },
  { id: "hc-lavender", category: "hairColor", name: "ラベンダー", hairTint: { hex: "#b8a8c8", strength: 0.38 } },
  { id: "hc-black", category: "hairColor", name: "黒髪", hairTint: { hex: "#2a2420", strength: 0.5 } },
  { id: "hc-ash", category: "hairColor", name: "アッシュ", hairTint: { hex: "#8a9098", strength: 0.4 } },
];

export const HAIR_STYLE_PRESETS: LookPreset[] = [
  {
    id: "hs-bob",
    category: "hairStyle",
    name: "ボブ",
    hairTint: { hex: "#b8a99a", strength: 0.25 },
    filter: { brightness: 1.03, contrast: 1.05, saturate: 1.02 },
  },
  {
    id: "hs-long",
    category: "hairStyle",
    name: "ロング",
    hairTint: { hex: "#a89a8e", strength: 0.22 },
    filter: { brightness: 1.02, contrast: 0.98, saturate: 1.05 },
  },
  {
    id: "hs-layer",
    category: "hairStyle",
    name: "レイヤー",
    hairTint: { hex: "#c4b5a8", strength: 0.28 },
    filter: { contrast: 1.08, saturate: 1.04 },
  },
  {
    id: "hs-bangs",
    category: "hairStyle",
    name: "前髪あり",
    hairTint: { hex: "#3d3530", strength: 0.35 },
    filter: { brightness: 1.04 },
  },
  {
    id: "hs-nobangs",
    category: "hairStyle",
    name: "前髪なし",
    hairTint: { hex: "#8a7d72", strength: 0.2 },
    filter: { brightness: 1.05, contrast: 1.02 },
  },
];

export const MAKEUP_PRESETS: LookPreset[] = [
  {
    id: "mk-korea",
    category: "makeup",
    name: "韓流きれいめ",
    makeup: { lipHex: "#e8a4a0", cheekHex: "#f0b8b0", strength: 0.35 },
    filter: { brightness: 1.06, saturate: 1.08 },
  },
  {
    id: "mk-clear",
    category: "makeup",
    name: "清楚系",
    makeup: { lipHex: "#d4a0a8", cheekHex: "#f5c4c0", strength: 0.28 },
    filter: { brightness: 1.08, contrast: 0.95 },
  },
  {
    id: "mk-actress",
    category: "makeup",
    name: "女優系",
    makeup: { lipHex: "#b87070", cheekHex: "#d49890", strength: 0.32 },
    filter: { contrast: 1.05, warmth: 0.08 },
  },
  {
    id: "mk-mature",
    category: "makeup",
    name: "大人っぽい",
    makeup: { lipHex: "#9a5058", cheekHex: "#c08078", strength: 0.3 },
    filter: { contrast: 1.1, saturate: 0.95 },
  },
  {
    id: "mk-girly",
    category: "makeup",
    name: "ガーリー",
    makeup: { lipHex: "#f08090", cheekHex: "#ffb0b8", strength: 0.4 },
    filter: { brightness: 1.05, saturate: 1.12 },
  },
];

export const FASHION_PRESETS: LookPreset[] = [
  {
    id: "fa-korea",
    category: "fashion",
    name: "韓国きれいめ",
    makeup: { lipHex: "#e09088", cheekHex: "#f0a8a0", strength: 0.25 },
    filter: { brightness: 1.05, saturate: 1.1, warmth: 0.05 },
  },
  {
    id: "fa-feminine",
    category: "fashion",
    name: "フェミニン",
    makeup: { lipHex: "#d88898", cheekHex: "#f5b0b8", strength: 0.3 },
    filter: { brightness: 1.04, saturate: 1.06 },
  },
  {
    id: "fa-pale",
    category: "fashion",
    name: "淡色女子",
    makeup: { lipHex: "#e8b8c8", cheekHex: "#f8d0d8", strength: 0.22 },
    filter: { brightness: 1.1, contrast: 0.92, saturate: 0.9 },
  },
  {
    id: "fa-mode",
    category: "fashion",
    name: "モード",
    filter: { contrast: 1.15, saturate: 0.85, brightness: 0.98 },
  },
  {
    id: "fa-casual",
    category: "fashion",
    name: "カジュアル",
    filter: { brightness: 1.05, saturate: 1.02, warmth: 0.06 },
  },
  {
    id: "fa-neat",
    category: "fashion",
    name: "きれいめ",
    makeup: { lipHex: "#c87878", cheekHex: "#e0a0a0", strength: 0.26 },
    filter: { contrast: 1.06, brightness: 1.03 },
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
    makeup: mk.makeup || fa.makeup,
    filter: {
      brightness: (mk.filter?.brightness || 1) * (fa.filter?.brightness || 1),
      contrast: ((mk.filter?.contrast || 1) + (fa.filter?.contrast || 1)) / 2,
      saturate: ((mk.filter?.saturate || 1) + (fa.filter?.saturate || 1)) / 2,
      warmth: (mk.filter?.warmth || 0) + (fa.filter?.warmth || 0),
    },
  };
}
