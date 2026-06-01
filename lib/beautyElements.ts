export type ElementCategoryId =
  | "personalColor"
  | "bone"
  | "faceType"
  | "animal"
  | "impression"
  | "style"
  | "charm"
  | "glowup";

export type ElementCategory = {
  id: ElementCategoryId;
  label: string;
  short: string;
};

export type ElementItem = {
  id: string;
  categoryId: ElementCategoryId;
  name: string;
  summary: string;
  tips: string[];
  avoid?: string[];
};

export const ELEMENT_CATEGORIES: ElementCategory[] = [
  { id: "personalColor", label: "パーソナルカラー", short: "色" },
  { id: "bone", label: "骨格診断", short: "骨格" },
  { id: "faceType", label: "顔タイプ", short: "顔タイプ" },
  { id: "animal", label: "動物顔", short: "動物顔" },
  { id: "impression", label: "第一印象", short: "印象" },
  { id: "style", label: "美容系統", short: "系統" },
  { id: "charm", label: "顔の魅力", short: "魅力" },
  { id: "glowup", label: "垢抜け", short: "垢抜け" },
];

export const ELEMENT_ITEMS: ElementItem[] = [
  {
    id: "pc-spring",
    categoryId: "personalColor",
    name: "イエベ春",
    summary: "明るく透明感のある暖色が似合うタイプ。フレッシュで軽やかな印象に。",
    tips: ["コーラル・ピーチ・明るいベージュ", "ゴールド系アクセ", "チークは頬の中央〜高め"],
    avoid: ["くすみすぎたダークトーン一色"],
  },
  {
    id: "pc-autumn",
    categoryId: "personalColor",
    name: "イエベ秋",
    summary: "深みのある暖色・マット感が似合う。落ち着いた大人っぽさが出やすい。",
    tips: ["テラコッタ・カーキ・ブラウン", "マットリップ", "縦ラインでスタイルアップ"],
  },
  {
    id: "pc-summer",
    categoryId: "personalColor",
    name: "ブルベ夏",
    summary: "ソフトで上品な寒色。ふんわり淡い色が肌をきれいに見せる。",
    tips: ["ラベンダー・ローズ・スモーキーピンク", "シルバーアクセ", "ツヤよりセミマット"],
  },
  {
    id: "pc-winter",
    categoryId: "personalColor",
    name: "ブルベ冬",
    summary: "コントラストのはっきりした寒色。シャープで洗練された印象に。",
    tips: ["ボルドー・ネイビー・ピュアホワイト", "はっきり眉", "ワンポイントの濃色"],
  },
  {
    id: "bone-straight",
    categoryId: "bone",
    name: "ストレート",
    summary: "縦ライン・Iラインが似合う。すっきり直線的なシルエットが得意。",
    tips: ["ハイウエスト", "Vネック", "ストレートヘア・ワンレングス"],
  },
  {
    id: "bone-wave",
    categoryId: "bone",
    name: "ウェーブ",
    summary: "曲線・レイヤーが似合う。柔らかく女性らしい雰囲気を出しやすい。",
    tips: ["フリル・ペプラム", "丸みのある襟", "レイヤーカット"],
  },
  {
    id: "bone-natural",
    categoryId: "bone",
    name: "ナチュラル",
    summary: "リラックス感・オーバーサイズが似合う。カジュアルでも品が出る。",
    tips: ["リネン・コットン", "ゆったりシルエット", "無造作ヘア"],
  },
  {
    id: "face-cute",
    categoryId: "faceType",
    name: "キュート",
    summary: "丸み・立体感のあるパーツが魅力。甘さと若々しさを活かせる。",
    tips: ["丸眉", "縦より横のバランス", "リボン・パフスリーブ"],
  },
  {
    id: "face-fresh",
    categoryId: "faceType",
    name: "フレッシュ",
    summary: "軽やかで明るい印象。清潔感と元気さが武器。",
    tips: ["シースルーバング", "オレンジ寄りチーク", "軽い素材"],
  },
  {
    id: "face-feminine",
    categoryId: "faceType",
    name: "フェミニン",
    summary: "女性らしい曲線美。柔らかく華やかなスタイルが似合う。",
    tips: ["ウェーブヘア", "ピンクベージュ", "パール"],
  },
  {
    id: "face-soft-elegant",
    categoryId: "faceType",
    name: "ソフトエレガント",
    summary: "上品で柔らかい大人の美しさ。品のあるきれいめが得意。",
    tips: ["ミディアムレイヤー", "淡色コーデ", "細めフレーム"],
  },
  {
    id: "face-elegant",
    categoryId: "faceType",
    name: "エレガント",
    summary: "洗練された直線と長さ。モード・きれいめで格が上がる。",
    tips: ["ロング", "モノトーン", "シャープ眉"],
  },
  {
    id: "face-cool",
    categoryId: "faceType",
    name: "クール",
    summary: "シャープでクールな印象。シンプル・モードが似合う。",
    tips: ["黒髪ショート", "ミニマルメイク", "直線的カット"],
  },
  {
    id: "animal-cat",
    categoryId: "animal",
    name: "猫顔",
    summary: "つり目・シャープな目元。ミステリアスで大人っぽい魅力。",
    tips: ["目元ライン", "グレージュ髪", "きれいめカジュアル"],
  },
  {
    id: "animal-dog",
    categoryId: "animal",
    name: "犬顔",
    summary: "下がり目・柔らかい目元。親しみやすく愛され感が出る。",
    tips: ["丸眉", "明るいリップ", "ふんわりパーマ"],
  },
  {
    id: "animal-fox",
    categoryId: "animal",
    name: "狐顔",
    summary: "切れ長・知的な目元。セクシーでモードな雰囲気。",
    tips: ["シャドウで立体感", "ダークリップ", "ハイツインテール"],
  },
  {
    id: "animal-deer",
    categoryId: "animal",
    name: "鹿顔",
    summary: "澄んだ目・繊細な印象。清楚で透明感が魅力。",
    tips: ["薄眉", "ピンクチーク", "ロングストレート"],
  },
  {
    id: "animal-rabbit",
    categoryId: "animal",
    name: "うさぎ顔",
    summary: "大きな目・童顔寄り。可愛らしさと甘さを活かせる。",
    tips: ["涙袋", "ピンク系", "ぱっつん前髪"],
  },
  {
    id: "imp-cute",
    categoryId: "impression",
    name: "可愛い系",
    summary: "親しみと守られたい感。柔らかい色・丸みが似合う。",
    tips: ["パステル", "リボン", "ツインテールも可"],
  },
  {
    id: "imp-beauty",
    categoryId: "impression",
    name: "美人系",
    summary: "整った美しさ・対称性。きれいめで洗練された見せ方が得意。",
    tips: ["シンプルコーデ", "ツヤ肌", "縦ライン"],
  },
  {
    id: "imp-clear",
    categoryId: "impression",
    name: "清楚系",
    summary: "清潔感・透明感。淡い色とナチュラルメイクが似合う。",
    tips: ["白・ベージュ", "薄眉", "ストレートヘア"],
  },
  {
    id: "imp-cool",
    categoryId: "impression",
    name: "クール系",
    summary: "距離感・シャープさ。モノトーンと直線的デザインが似合う。",
    tips: ["黒", "レザー", "ミニマルアクセ"],
  },
  {
    id: "imp-friendly",
    categoryId: "impression",
    name: "親しみやすい系",
    summary: "笑顔・柔らかさ。暖色とカジュアルが好印象。",
    tips: ["暖色リップ", "ニット", "自然な眉"],
  },
  {
    id: "imp-smart",
    categoryId: "impression",
    name: "知的系",
    summary: "落ち着き・信頼感。きちんと感のあるコーデが似合う。",
    tips: ["シャツ", "メガネ", "低彩度"],
  },
  {
    id: "style-korea",
    categoryId: "style",
    name: "韓国スター系",
    summary: "ツヤ肌・グラデ・韓国ヘア。今っぽいきれいめカジュアル。",
    tips: ["涙袋", "オーバーリップ", "レイヤー"],
  },
  {
    id: "style-actress",
    categoryId: "style",
    name: "女優系",
    summary: "品と女性らしさ。自然な美しさを引き出すメイク。",
    tips: ["ロング", "ブラウン", "シンプルドレス"],
  },
  {
    id: "style-model",
    categoryId: "style",
    name: "モデル系",
    summary: "モード・シルエット。服を主役にしたスタイリング。",
    tips: ["オーバーサイズ", "モノトーン", "直線カット"],
  },
  {
    id: "style-french",
    categoryId: "style",
    name: "フレンチガーリー系",
    summary: "抜け感・赤リップ。カジュアルに品を混ぜる。",
    tips: ["デニム", "赤リップ", "バスク帽"],
  },
  {
    id: "style-onee",
    categoryId: "style",
    name: "お姉さん系",
    summary: "大人の色気・深み。ダークトーンと女性らしいライン。",
    tips: ["ワインレッド", "Iライン", "ロングウェーブ"],
  },
  {
    id: "style-pale",
    categoryId: "style",
    name: "淡色女子系",
    summary: "淡い色の重ね着。ふんわり優しい全体トーン。",
    tips: ["ラベンダー", "ペプラム", "チュール"],
  },
  {
    id: "charm-eye",
    categoryId: "charm",
    name: "目力",
    summary: "目元の印象力。メイクで最も変化が出やすいパーツ。",
    tips: ["マスカラの付け方", "目元ラインの角度", "涙袋の入れ方"],
  },
  {
    id: "charm-contour",
    categoryId: "charm",
    name: "輪郭",
    summary: "顔の形・フェイスライン。ヘアとメイクで補正しやすい。",
    tips: ["シェーディング", "前髪の量", "耳かけ"],
  },
  {
    id: "charm-profile",
    categoryId: "charm",
    name: "横顔",
    summary: "Eライン・鼻・顎のバランス。横顔の美しさは髪型にも左右される。",
    tips: ["ロングで縦ライン", "鼻筋ハイライト", "眉の角度"],
  },
  {
    id: "charm-nose",
    categoryId: "charm",
    name: "鼻筋",
    summary: "鼻の存在感。シャドウとハイライトで整えやすい。",
    tips: ["鼻翼のシェード", "小鼻のマット", "正面の光"],
  },
  {
    id: "charm-clarity",
    categoryId: "charm",
    name: "透明感",
    summary: "肌の質感・色ムラ。スキンケアとベースメイクが鍵。",
    tips: ["UV対策", "薄付きファンデ", "パールハイライト"],
  },
  {
    id: "charm-balance",
    categoryId: "charm",
    name: "顔のバランス",
    summary: "パーツの比率全体。どこを強調するかで印象が変わる。",
    tips: ["眉とリップのバランス", "チーク位置", "重心の置き方"],
  },
  {
    id: "glow-bangs",
    categoryId: "glowup",
    name: "前髪",
    summary: "顔の印象を最も変えやすい。シースルー・重さ・長さがポイント。",
    tips: ["顔型に合わせた分け目", "参考写真を美容師に", "シミュレーションで確認"],
  },
  {
    id: "glow-brow",
    categoryId: "glowup",
    name: "眉毛",
    summary: "表情の8割。形・太さ・色で印象が大きく変わる。",
    tips: ["骨格に合う眉", "眉マスカラ", "サロンで形を整える"],
  },
  {
    id: "glow-haircolor",
    categoryId: "glowup",
    name: "髪色",
    summary: "肌のトーンと連動。パーソナルカラーに沿うと一気に垢抜ける。",
    tips: ["グレージュ・ミルクティー", "退色のメンテ", "根元のリタッチ"],
  },
  {
    id: "glow-makeup",
    categoryId: "glowup",
    name: "メイク",
    summary: "日々の完成度。似合う色と配置を固定すると安定する。",
    tips: ["チーク位置", "リップ1色決め", "ツヤとマットの使い分け"],
  },
  {
    id: "glow-fashion",
    categoryId: "glowup",
    name: "ファッション",
    summary: "全体の系統統一。トップス1枚で印象が決まることも。",
    tips: ["系統を1つに", "色数を3色以内", "シルエットの統一"],
  },
];

export function getItemsByCategory(categoryId: ElementCategoryId): ElementItem[] {
  return ELEMENT_ITEMS.filter((i) => i.categoryId === categoryId);
}

export function getProfileElementTags(profile: {
  personalColor: string;
  boneStructure: string;
  faceType: string;
  animalFace: string;
  firstImpressions: string[];
  beautyStyles: string[];
  glowUpTips: { area: string }[];
}): { categoryId: ElementCategoryId; name: string }[] {
  return [
    { categoryId: "personalColor", name: profile.personalColor },
    { categoryId: "bone", name: profile.boneStructure },
    { categoryId: "faceType", name: profile.faceType },
    { categoryId: "animal", name: profile.animalFace },
    ...profile.firstImpressions.map((name) => ({
      categoryId: "impression" as const,
      name,
    })),
    ...profile.beautyStyles.map((name) => ({
      categoryId: "style" as const,
      name,
    })),
    ...profile.glowUpTips.map((t) => ({
      categoryId: "glowup" as const,
      name: t.area,
    })),
  ];
}
