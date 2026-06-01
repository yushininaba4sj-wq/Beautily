import type { LookPreset } from "./lookPresets";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (src.startsWith("http://") || src.startsWith("https://")) {
      img.crossOrigin = "anonymous";
    }
    img.onload = () => {
      if (img.naturalWidth < 1 || img.naturalHeight < 1) {
        reject(new Error("画像サイズが不正です"));
        return;
      }
      resolve(img);
    };
    img.onerror = () => reject(new Error("画像の読み込みに失敗しました"));
    img.src = src;
  });
}

function hexToRgb(hex: string) {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function rgbToHsl(r: number, g: number, b: number) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      default:
        h = ((r - g) / d + 4) / 6;
    }
  }
  return { h, s, l };
}

function hslToRgb(h: number, s: number, l: number) {
  let r: number, g: number, b: number;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      let tt = t;
      if (tt < 0) tt += 1;
      if (tt > 1) tt -= 1;
      if (tt < 1 / 6) return p + (q - p) * 6 * tt;
      if (tt < 1 / 2) return q;
      if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

/** YCbCr 肌色検出 — 髪色処理から顔を守る */
function isSkinPixel(r: number, g: number, b: number): boolean {
  if (r < 45 && g < 45 && b < 45) return false;
  const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
  const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;
  return cb >= 75 && cb <= 130 && cr >= 130 && cr <= 178;
}

function luminance(r: number, g: number, b: number) {
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

function buildHairMask(
  data: Uint8ClampedArray,
  w: number,
  h: number
): Float32Array {
  const mask = new Float32Array(w * h);
  const cx = w * 0.5;
  const cy = h * 0.3;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      const i = idx * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const skin = isSkinPixel(r, g, b);
      const lum = luminance(r, g, b);

      if (y > h * 0.52 || skin) {
        mask[idx] = 0;
        continue;
      }

      const ny = y / h;
      const nx = (x - cx) / (w * 0.36);
      const nyf = (y - cy) / (h * 0.22);
      const faceEllipse = nx * nx + nyf * nyf;
      const inFace = faceEllipse < 1;

      let m = Math.max(0, 1 - ny * 1.1);
      if (inFace) m *= Math.max(0, faceEllipse - 0.35);

      if (ny < 0.35 && lum < 0.55 && !skin) m = Math.max(m, 0.8);
      if (ny < 0.22 && !skin) m = Math.max(m, 0.55);

      mask[idx] = Math.min(1, Math.max(0, m));
    }
  }

  return featherMask(mask, w, h, 3);
}

function featherMask(mask: Float32Array, w: number, h: number, radius: number) {
  const out = new Float32Array(mask.length);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let sum = 0;
      let count = 0;
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
          sum += mask[ny * w + nx];
          count++;
        }
      }
      out[y * w + x] = sum / count;
    }
  }
  return out;
}

/** 明度を保ったまま色相だけ変える（自然な髪色） */
function applyHairColorNatural(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  tint: { hex: string; strength: number }
) {
  let imgData: ImageData;
  try {
    imgData = ctx.getImageData(0, 0, w, h);
  } catch {
    return;
  }
  const hairMask = buildHairMask(imgData.data, w, h);
  const { r: tr, g: tg, b: tb } = hexToRgb(tint.hex);
  const target = rgbToHsl(tr, tg, tb);
  const power = Math.min(0.85, tint.strength);
  const d = imgData.data;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      const blend = hairMask[idx] * power;
      if (blend < 0.04) continue;

      const i = idx * 4;
      if (isSkinPixel(d[i], d[i + 1], d[i + 2])) continue;

      const src = rgbToHsl(d[i], d[i + 1], d[i + 2]);
      const nh = src.h * (1 - blend) + target.h * blend;
      const ns = src.s * (1 - blend * 0.4) + target.s * blend * 0.75;
      const nl = src.l;
      const out = hslToRgb(nh, Math.min(1, ns), nl);
      d[i] = d[i] * (1 - blend) + out.r * blend;
      d[i + 1] = d[i + 1] * (1 - blend) + out.g * blend;
      d[i + 2] = d[i + 2] * (1 - blend) + out.b * blend;
    }
  }
  ctx.putImageData(imgData, 0, 0);
}

function applyHairStyle(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  effect: NonNullable<LookPreset["hairStyleEffect"]>
) {
  const hairOnly = (fn: () => void) => {
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(w * 0.5, h * 0.22, w * 0.48, h * 0.28, 0, 0, Math.PI * 2);
    ctx.clip();
    fn();
    ctx.restore();
  };

  switch (effect) {
    case "bangs":
      hairOnly(() => {
        const g = ctx.createLinearGradient(0, h * 0.1, 0, h * 0.34);
        g.addColorStop(0, "rgba(28,22,20,0.65)");
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.globalCompositeOperation = "multiply";
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h * 0.36);
      });
      break;
    case "no-bangs":
      hairOnly(() => {
        ctx.globalCompositeOperation = "screen";
        ctx.fillStyle = "rgba(255,250,248,0.22)";
        ctx.fillRect(w * 0.15, 0, w * 0.7, h * 0.2);
      });
      break;
    case "bob":
      hairOnly(() => {
        ctx.globalCompositeOperation = "multiply";
        for (const cx of [w * 0.15, w * 0.85]) {
          const g = ctx.createRadialGradient(cx, h * 0.35, 0, cx, h * 0.35, w * 0.32);
          g.addColorStop(0, "rgba(40,32,28,0.35)");
          g.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = g;
          ctx.fillRect(0, 0, w, h);
        }
      });
      break;
    case "long":
      hairOnly(() => {
        const g = ctx.createLinearGradient(0, h * 0.3, 0, h * 0.55);
        g.addColorStop(0, "rgba(0,0,0,0)");
        g.addColorStop(1, "rgba(45,38,32,0.3)");
        ctx.globalCompositeOperation = "multiply";
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      });
      break;
    case "layer":
      hairOnly(() => {
        ctx.globalCompositeOperation = "soft-light";
        ctx.fillStyle = "rgba(255,255,255,0.12)";
        ctx.fillRect(0, 0, w, h * 0.45);
      });
      break;
  }
  ctx.globalCompositeOperation = "source-over";
}

function faceMaskWeight(x: number, y: number, w: number, h: number): number {
  const cx = w * 0.5;
  const cy = h * 0.4;
  const nx = (x - cx) / (w * 0.36);
  const ny = (y - cy) / (h * 0.26);
  const d = nx * nx + ny * ny;
  if (d > 1) return 0;
  return Math.pow(1 - d, 0.8);
}

function applyMakeup(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  makeup: NonNullable<LookPreset["makeup"]>
) {
  const lip = hexToRgb(makeup.lipHex);
  const cheek = hexToRgb(makeup.cheekHex);
  const eye = hexToRgb(makeup.eyeHex || makeup.cheekHex);
  const s = Math.min(0.75, makeup.strength);
  const cheekY = h * (makeup.cheekHeight ?? 0.43);

  let imgData: ImageData;
  try {
    imgData = ctx.getImageData(0, 0, w, h);
  } catch {
    return;
  }
  const d = imgData.data;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const face = faceMaskWeight(x, y, w, h);
      if (face < 0.08) continue;
      const i = (y * w + x) * 4;
      const ny = y / h;
      let r = d[i];
      let g = d[i + 1];
      let b = d[i + 2];

      if (ny > 0.64 && ny < 0.8 && Math.abs(x / w - 0.5) < 0.12) {
        const t = face * s;
        r = r * (1 - t) + lip.r * t;
        g = g * (1 - t) + lip.g * t;
        b = b * (1 - t) + lip.b * t;
      }
      if (ny > cheekY / h - 0.05 && ny < cheekY / h + 0.08) {
        const cx = x / w;
        if (cx < 0.4 || cx > 0.6) {
          const t = face * s * 0.7;
          r = r * (1 - t) + cheek.r * t;
          g = g * (1 - t) + cheek.g * t;
          b = b * (1 - t) + cheek.b * t;
        }
      }
      if (ny > 0.35 && ny < 0.5) {
        const t = face * s * 0.35;
        r = r * (1 - t) + eye.r * t;
        g = g * (1 - t) + eye.g * t;
        b = b * (1 - t) + eye.b * t;
      }
      d[i] = r;
      d[i + 1] = g;
      d[i + 2] = b;
    }
  }
  ctx.putImageData(imgData, 0, 0);

  ctx.globalCompositeOperation = "soft-light";
  const lipG = ctx.createRadialGradient(w * 0.5, h * 0.72, 0, w * 0.5, h * 0.72, w * 0.12);
  lipG.addColorStop(0, `rgba(${lip.r},${lip.g},${lip.b},${s * 0.5})`);
  lipG.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = lipG;
  ctx.fillRect(0, 0, w, h);
  ctx.globalCompositeOperation = "source-over";
}

function applyFashion(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  overlay: NonNullable<LookPreset["fashionOverlay"]>
) {
  const top = hexToRgb(overlay.topHex);
  const accent = hexToRgb(overlay.accentHex || overlay.topHex);
  const power = Math.min(0.8, overlay.strength);
  const yStart = h * 0.52;

  let imgData: ImageData;
  try {
    imgData = ctx.getImageData(0, 0, w, h);
  } catch {
    return;
  }
  const d = imgData.data;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (y < yStart) continue;
      const face = faceMaskWeight(x, y, w, h);
      if (face > 0.5) continue;

      const i = (y * w + x) * 4;
      if (isSkinPixel(d[i], d[i + 1], d[i + 2]) && y < h * 0.65) continue;

      const t = ((y - yStart) / (h - yStart)) * power;
      const useAccent = y > h * 0.72;
      const tr = useAccent ? accent.r : top.r;
      const tg = useAccent ? accent.g : top.g;
      const tb = useAccent ? accent.b : top.b;
      d[i] = d[i] * (1 - t) + tr * t;
      d[i + 1] = d[i + 1] * (1 - t) + tg * t;
      d[i + 2] = d[i + 2] * (1 - t) + tb * t;
    }
  }
  ctx.putImageData(imgData, 0, 0);
}

function applyColorFilter(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  filter: NonNullable<LookPreset["filter"]>
) {
  let imgData: ImageData;
  try {
    imgData = ctx.getImageData(0, 0, w, h);
  } catch {
    return;
  }
  const d = imgData.data;
  const br = filter.brightness ?? 1;
  const ct = filter.contrast ?? 1;
  const sat = filter.saturate ?? 1;

  for (let i = 0; i < d.length; i += 4) {
    let r = d[i];
    let g = d[i + 1];
    let b = d[i + 2];
    r = ((r / 255 - 0.5) * ct + 0.5) * 255 * br;
    g = ((g / 255 - 0.5) * ct + 0.5) * 255 * br;
    b = ((b / 255 - 0.5) * ct + 0.5) * 255 * br;
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;
    r = gray + (r - gray) * sat;
    g = gray + (g - gray) * sat;
    b = gray + (b - gray) * sat;
    d[i] = Math.min(255, Math.max(0, r));
    d[i + 1] = Math.min(255, Math.max(0, g));
    d[i + 2] = Math.min(255, Math.max(0, b));
  }
  ctx.putImageData(imgData, 0, 0);
}

function applyPresetByCategory(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  preset: LookPreset
) {
  const cat = preset.category;

  if (cat === "hairColor") {
    if (preset.hairTint) applyHairColorNatural(ctx, w, h, preset.hairTint);
    return;
  }
  if (cat === "hairStyle") {
    if (preset.hairTint)
      applyHairColorNatural(ctx, w, h, {
        ...preset.hairTint,
        strength: preset.hairTint.strength * 0.45,
      });
    if (preset.hairStyleEffect) applyHairStyle(ctx, w, h, preset.hairStyleEffect);
    return;
  }
  if (cat === "makeup") {
    if (preset.makeup) applyMakeup(ctx, w, h, preset.makeup);
    if (preset.filter) applyColorFilter(ctx, w, h, preset.filter);
    return;
  }
  if (cat === "fashion") {
    if (preset.fashionOverlay) applyFashion(ctx, w, h, preset.fashionOverlay);
    return;
  }

  if (preset.hairTint) applyHairColorNatural(ctx, w, h, preset.hairTint);
  if (preset.hairStyleEffect) applyHairStyle(ctx, w, h, preset.hairStyleEffect);
  if (preset.fashionOverlay) applyFashion(ctx, w, h, preset.fashionOverlay);
  if (preset.makeup) applyMakeup(ctx, w, h, preset.makeup);
  if (preset.filter) applyColorFilter(ctx, w, h, preset.filter);
}

export async function renderLookPreview(
  photoDataUrl: string,
  preset: LookPreset
): Promise<string> {
  if (
    !photoDataUrl.startsWith("data:") &&
    !photoDataUrl.startsWith("blob:") &&
    !photoDataUrl.startsWith("http")
  ) {
    throw new Error("写真データが無効です。もう一度診断してください。");
  }

  const img = await loadImage(photoDataUrl);
  const maxW = 900;
  const scale = Math.min(1, maxW / img.naturalWidth);
  const w = Math.max(1, Math.round(img.naturalWidth * scale));
  const h = Math.max(1, Math.round(img.naturalHeight * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("描画に失敗しました");

  ctx.drawImage(img, 0, 0, w, h);
  applyPresetByCategory(ctx, w, h, preset);

  try {
    return canvas.toDataURL("image/jpeg", 0.93);
  } catch {
    throw new Error("プレビュー画像の作成に失敗しました");
  }
}

export async function renderLookGallery(
  photoDataUrl: string,
  presets: LookPreset[]
): Promise<{ preset: LookPreset; imageUrl: string }[]> {
  const out: { preset: LookPreset; imageUrl: string }[] = [];
  for (const preset of presets) {
    try {
      out.push({ preset, imageUrl: await renderLookPreview(photoDataUrl, preset) });
    } catch {
      /* skip */
    }
  }
  return out;
}
