import type { BeautyProfile } from "./types";

const COLORS = ["イエベ春", "イエベ秋", "ブルベ夏", "ブルベ冬"] as const;
const BONES = ["ストレート", "ウェーブ", "ナチュラル"] as const;
const FACES = [
  "キュート",
  "フレッシュ",
  "フェミニン",
  "ソフトエレガント",
  "エレガント",
  "クール",
] as const;
const ANIMALS = ["猫顔", "犬顔", "狐顔", "鹿顔", "うさぎ顔"] as const;

function pick<T>(arr: readonly T[], seed: number): T {
  return arr[seed % arr.length];
}

function hashSeed(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) h = (h << 5) - h + input.charCodeAt(i);
  return Math.abs(h);
}

/** デモ用：顔写真から一貫した診断結果を生成 */
export function analyzePhoto(photoDataUrl: string): BeautyProfile {
  const seed = hashSeed(photoDataUrl.slice(0, 2000));
  const personalColor = pick(COLORS, seed);
  const boneStructure = pick(BONES, seed + 1);
  const faceType = pick(FACES, seed + 2);
  const animalFace = pick(ANIMALS, seed + 3);

  const profile: BeautyProfile = {
    id: "bp_" + Date.now(),
    photoUrl: photoDataUrl,
    analyzedAt: new Date().toISOString(),
    personalColor,
    boneStructure,
    faceType,
    animalFace,
    firstImpressions: ["清楚系", "知的系", "美人系"],
    beautyStyles: ["韓国スター系", "女優系", "淡色女子系"],
    charm: {
      eyePower: 72 + (seed % 20),
      contour: 68 + (seed % 25),
      profile: 75 + (seed % 18),
      noseLine: 70 + (seed % 22),
      clarity: 78 + (seed % 15),
      balance: 80 + (seed % 12),
    },
    glowUpTips: [
      { area: "前髪", priority: 1, advice: "目元を柔らかく見せるシースルーバングが最も効果的です。" },
      { area: "眉毛", priority: 2, advice: "ややアーチを足して、横顔の印象を整えましょう。" },
      { area: "髪色", priority: 3, advice: personalColor.includes("ブル") ? "アッシュ系ミルクティーが透明感を出します。" : "ピンクブラウンで血色感をプラス。" },
      { area: "メイク", priority: 4, advice: "縦幅より横幅を活かすチーク配置が似合います。" },
      { area: "ファッション", priority: 5, advice: "淡色×きれいめのレイヤードで完成度が上がります。" },
    ],
    impressions: ["上品", "知的", "柔らかい"],
    matchingStyles: ["韓国きれいめ", "フェミニン", "淡色女子"],
    celebrities: ["石原さとみ", "中村アン", "TWICE サナ"],
    roadmap: [],
    makeup: {
      眉毛: ["やわらかアーチ", "薄めで縦ライン"],
      目元メイク: ["ブラウンピンク", "涙袋ハイライト"],
      涙袋: ["ペールピンク", "控えめグリッター"],
      チーク: ["頬骨上・斜め", "コーラルピンク"],
      リップ: ["ローズベージュ", "ティント"],
      肌質: ["ツヤ肌", "セミマット"],
    },
    hairStyle: ["ミディアムレイヤー", "韓国ヘア", "前髪あり"],
    hairColor: ["ミルクティー", "グレージュ", "ラベンダーアッシュ"],
    fashion: ["韓国きれいめ", "フェミニン", "淡色コーデ"],
    accessories: ["細めゴールド", "パールピアス", "ミニバッグ"],
  };

  profile.roadmap = profile.glowUpTips.map((t, i) => ({
    step: i + 1,
    title: t.area + "を改善",
    detail: t.advice,
  }));

  return profile;
}

export function shareText(p: BeautyProfile): string {
  return `【Beautily診断】\n${p.animalFace} × ${p.personalColor} × ${p.boneStructure}\n顔タイプ：${p.faceType}\n#Beautily #美容診断`;
}

export function advisorReply(question: string, profile: BeautyProfile | null): string {
  const q = question.toLowerCase();
  if (!profile) {
    return "まず「診断」タブで顔写真をアップロードしてください。診断後、あなた専用のアドバイスが可能になります。";
  }
  if (q.includes("リップ") || q.includes("口紅")) {
    return `あなた（${profile.personalColor}）には、${profile.makeup.リップ?.join("・") || "ローズベージュ"}がおすすめです。今のメイクならティント＋中央ぷっくりが似合います。`;
  }
  if (q.includes("前髪")) {
    return `${profile.faceType}×${profile.animalFace}の場合、${profile.glowUpTips[0]?.advice || "シースルーバングがおすすめ"}。切る前に参考画像でシミュレーションを試してみてください。`;
  }
  if (q.includes("服") || q.includes("コーデ") || q.includes("デート")) {
    return `似合う系統は「${profile.matchingStyles.join("」「")}」。${profile.personalColor}なら淡色×きれいめのワンピか、韓国きれいめのセットアップが安心です。`;
  }
  if (q.includes("髪色")) {
    return `おすすめ髪色：${profile.hairColor.join(" / ")}。美容師には「${profile.hairColor[0]}をベースに透明感」を伝えると伝わりやすいです。`;
  }
  return `診断ベースでは、${profile.faceType}・${profile.animalFace}・${profile.personalColor}の方には、${profile.matchingStyles[0]}系が最も垢抜けます。具体的な商品があれば画像を送ってくださいね。`;
}

export function shopVerdict(
  _imageNote: string,
  profile: BeautyProfile | null
): { verdict: "似合う" | "普通" | "あまりおすすめしない"; reason: string } {
  if (!profile) {
    return { verdict: "普通", reason: "診断データがないため一般的な目安です。先に診断すると精度が上がります。" };
  }
  const r = Math.random();
  if (r > 0.55) {
    return {
      verdict: "似合う",
      reason: `${profile.personalColor}と${profile.faceType}に合う色味・シルエットです。${profile.matchingStyles[0]}系として活かせます。`,
    };
  }
  if (r > 0.25) {
    return { verdict: "普通", reason: "悪くはありませんが、より似合う選択肢があります。提案タブのリストを参考に。" };
  }
  return {
    verdict: "あまりおすすめしない",
    reason: `今の診断では${profile.matchingStyles.join("・")}寄りの方が垢抜けやすいです。`,
  };
}
