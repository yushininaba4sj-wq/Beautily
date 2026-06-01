import type { LookCategory, LookPreset } from "./lookPresets";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (src.startsWith("http://") || src.startsWith("https://")) {
      img.crossOrigin = "anonymous";
    }
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("参考画像の読み込みに失敗しました"));
    img.src = src;
  });
}

function rgbToHex(r: number, g: number, b: number) {
  const c = (n: number) => Math.min(255, Math.max(0, Math.round(n)));
  return `#${[c(r), c(g), c(b)].map((x) => x.toString(16).padStart(2, "0")).join("")}`;
}

type Rgb = { r: number; g: number; b: number };

function sampleRegion(
  data: Uint8ClampedArray,
  w: number,
  h: number,
  region: { x0: number; y0: number; x1: number; y1: number }
): Rgb[] {
  const pixels: Rgb[] = [];
  const xs = Math.floor(w * region.x0);
  const xe = Math.floor(w * region.x1);
  const ys = Math.floor(h * region.y0);
  const ye = Math.floor(h * region.y1);
  const step = Math.max(1, Math.floor((xe - xs) / 24));

  for (let y = ys; y < ye; y += step) {
    for (let x = xs; x < xe; x += step) {
      const i = (y * w + x) * 4;
      const a = data[i + 3];
      if (a < 128) continue;
      pixels.push({ r: data[i], g: data[i + 1], b: data[i + 2] });
    }
  }
  return pixels;
}

function averageColor(pixels: Rgb[]): Rgb {
  if (!pixels.length) return { r: 180, g: 160, b: 150 };
  const sum = pixels.reduce(
    (a, p) => ({ r: a.r + p.r, g: a.g + p.g, b: a.b + p.b }),
    { r: 0, g: 0, b: 0 }
  );
  return {
    r: sum.r / pixels.length,
    g: sum.g / pixels.length,
    b: sum.b / pixels.length,
  };
}

function vibrantFilter(pixels: Rgb[]): Rgb[] {
  return pixels.filter((p) => {
    const max = Math.max(p.r, p.g, p.b);
    const min = Math.min(p.r, p.g, p.b);
    return max - min > 18 && max > 40;
  });
}

async function getImageData(url: string) {
  const img = await loadImage(url);
  const w = Math.min(320, img.naturalWidth);
  const scale = w / img.naturalWidth;
  const h = Math.round(img.naturalHeight * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("画像処理に失敗しました");
  ctx.drawImage(img, 0, 0, w, h);
  return { data: ctx.getImageData(0, 0, w, h).data, w, h };
}

export async function buildPresetFromReference(
  refDataUrl: string,
  category: LookCategory,
  label?: string
): Promise<LookPreset> {
  const { data, w, h } = await getImageData(refDataUrl);
  const id = `ref_${category}_${Date.now()}`;
  const name = label || "マイ参考スタイル";

  if (category === "hairColor" || category === "hairStyle") {
    const top = sampleRegion(data, w, h, { x0: 0, y0: 0, x1: 1, y1: 0.45 });
    const vibrant = vibrantFilter(top);
    const avg = averageColor(vibrant.length > 8 ? vibrant : top);
    const hex = rgbToHex(avg.r, avg.g, avg.b);
    return {
      id,
      category,
      name,
      hairTint: { hex, strength: 0.95 },
      hairStyleEffect: category === "hairStyle" ? "layer" : undefined,
      fromReference: refDataUrl,
    };
  }

  if (category === "makeup") {
    const lips = sampleRegion(data, w, h, { x0: 0.35, y0: 0.55, x1: 0.65, y1: 0.85 });
    const cheeks = sampleRegion(data, w, h, { x0: 0.1, y0: 0.35, x1: 0.9, y1: 0.6 });
    const eyes = sampleRegion(data, w, h, { x0: 0.2, y0: 0.25, x1: 0.8, y1: 0.5 });
    const lip = averageColor(vibrantFilter(lips).length ? vibrantFilter(lips) : lips);
    const cheek = averageColor(cheeks);
    const eye = averageColor(eyes);
    return {
      id,
      category,
      name,
      makeup: {
        lipHex: rgbToHex(lip.r, lip.g, lip.b),
        cheekHex: rgbToHex(cheek.r, cheek.g, cheek.b),
        eyeHex: rgbToHex(eye.r, eye.g, eye.b),
        strength: 0.82,
        cheekHeight: 0.43,
      },
      fromReference: refDataUrl,
    };
  }

  if (category === "fashion") {
    const body = sampleRegion(data, w, h, { x0: 0, y0: 0.35, x1: 1, y1: 1 });
    const accent = sampleRegion(data, w, h, { x0: 0.15, y0: 0.4, x1: 0.85, y1: 0.75 });
    const top = averageColor(vibrantFilter(body).length ? vibrantFilter(body) : body);
    const acc = averageColor(accent);
    return {
      id,
      category,
      name,
      fashionOverlay: {
        topHex: rgbToHex(top.r, top.g, top.b),
        accentHex: rgbToHex(acc.r, acc.g, acc.b),
        strength: 0.88,
      },
      fromReference: refDataUrl,
    };
  }

  const all = sampleRegion(data, w, h, { x0: 0, y0: 0, x1: 1, y1: 1 });
  const avg = averageColor(all);
  const hex = rgbToHex(avg.r, avg.g, avg.b);
  return {
    id,
    category: "finish",
    name,
    hairTint: { hex, strength: 0.85 },
    makeup: {
      lipHex: hex,
      cheekHex: hex,
      strength: 0.7,
      cheekHeight: 0.44,
    },
    fashionOverlay: {
      topHex: hex,
      strength: 0.8,
    },
    fromReference: refDataUrl,
  };
}

export type SavedCustomPreset = LookPreset & { fromReference?: string };

const STORAGE_KEY = "beautily_custom_presets";

export function loadCustomPresets(): SavedCustomPreset[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SavedCustomPreset[]) : [];
  } catch {
    return [];
  }
}

export function saveCustomPreset(preset: SavedCustomPreset): SavedCustomPreset[] {
  const list = loadCustomPresets().filter((p) => p.id !== preset.id);
  list.unshift(preset);
  const trimmed = list.slice(0, 20);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  return trimmed;
}
