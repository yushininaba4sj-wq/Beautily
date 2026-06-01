import type { LookCategory, LookPreset } from "./lookPresets";

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

function hairMaskWeight(x: number, y: number, w: number, h: number): number {
  if (y > h * 0.58) return 0;
  const topBias = 1 - (y / (h * 0.58)) * 0.35;
  const cx = w * 0.5;
  const cy = h * 0.33;
  const nx = (x - cx) / (w * 0.34);
  const ny = (y - cy) / (h * 0.19);
  const faceDist = nx * nx + ny * ny;
  const faceBlock = faceDist < 1 ? Math.max(0, 1 - faceDist) * 0.88 : 0;
  let weight = Math.max(0, topBias * (1 - faceBlock));
  if (y < h * 0.2) weight = Math.max(weight, 0.85);
  return weight;
}

function faceMaskWeight(x: number, y: number, w: number, h: number): number {
  const cx = w * 0.5;
  const cy = h * 0.42;
  const nx = (x - cx) / (w * 0.38);
  const ny = (y - cy) / (h * 0.28);
  const d = nx * nx + ny * ny;
  if (d > 1) return 0;
  return Math.pow(1 - d, 0.7);
}

function bodyMaskWeight(x: number, y: number, w: number, h: number): number {
  if (y < h * 0.38) return 0;
  const t = (y - h * 0.38) / (h * 0.62);
  return Math.min(1, t * 1.15);
}

function applyHairColorHSL(
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
  const { r: tr, g: tg, b: tb } = hexToRgb(tint.hex);
  const target = rgbToHsl(tr, tg, tb);
  const power = Math.min(1, tint.strength);
  const d = imgData.data;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const mask = hairMaskWeight(x, y, w, h);
      if (mask < 0.06) continue;
      const i = (y * w + x) * 4;
      const blend = mask * power;
      const src = rgbToHsl(d[i], d[i + 1], d[i + 2]);
      const nh = src.h * (1 - blend) + target.h * blend;
      const ns = src.s * (1 - blend * 0.85) + Math.min(1, target.s * 1.1) * blend * 0.85;
      const nl = src.l * (1 - blend * 0.55) + target.l * blend * 0.55;
      const out = hslToRgb(nh, ns, nl);
      d[i] = out.r;
      d[i + 1] = out.g;
      d[i + 2] = out.b;
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
  switch (effect) {
    case "bangs": {
      const g = ctx.createLinearGradient(0, h * 0.08, 0, h * 0.36);
      g.addColorStop(0, "rgba(25,20,18,0.72)");
      g.addColorStop(0.55, "rgba(45,38,35,0.45)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.globalCompositeOperation = "multiply";
      ctx.fillStyle = g;
      ctx.fillRect(w * 0.12, 0, w * 0.76, h * 0.38);
      break;
    }
    case "no-bangs": {
      ctx.globalCompositeOperation = "screen";
      ctx.fillStyle = "rgba(255,248,245,0.28)";
      ctx.fillRect(w * 0.18, 0, w * 0.64, h * 0.22);
      break;
    }
    case "bob": {
      ctx.globalCompositeOperation = "multiply";
      for (const cx of [w * 0.1, w * 0.9]) {
        const g = ctx.createRadialGradient(cx, h * 0.4, 0, cx, h * 0.4, w * 0.38);
        g.addColorStop(0, "rgba(35,28,25,0.4)");
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, h * 0.15, w, h * 0.5);
      }
      break;
    }
    case "long": {
      const g = ctx.createLinearGradient(0, h * 0.32, 0, h);
      g.addColorStop(0, "rgba(0,0,0,0)");
      g.addColorStop(0.35, "rgba(50,42,38,0.25)");
      g.addColorStop(1, "rgba(30,25,22,0.5)");
      ctx.globalCompositeOperation = "multiply";
      ctx.fillStyle = g;
      ctx.fillRect(0, h * 0.28, w, h * 0.72);
      const frame = ctx.createLinearGradient(0, 0, w, 0);
      frame.addColorStop(0, "rgba(28,22,20,0.35)");
      frame.addColorStop(0.12, "rgba(0,0,0,0)");
      frame.addColorStop(0.88, "rgba(0,0,0,0)");
      frame.addColorStop(1, "rgba(28,22,20,0.35)");
      ctx.fillStyle = frame;
      ctx.fillRect(0, h * 0.2, w, h * 0.65);
      break;
    }
    case "layer": {
      ctx.globalCompositeOperation = "overlay";
      const g = ctx.createLinearGradient(0, h * 0.12, 0, h * 0.48);
      g.addColorStop(0, "rgba(255,255,255,0.15)");
      g.addColorStop(0.5, "rgba(80,70,65,0.12)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h * 0.52);
      break;
    }
  }
  ctx.globalCompositeOperation = "source-over";
}

function applyMakeupMasked(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  makeup: NonNullable<LookPreset["makeup"]>
) {
  let imgData: ImageData;
  try {
    imgData = ctx.getImageData(0, 0, w, h);
  } catch {
    applyMakeupOverlay(ctx, w, h, makeup);
    return;
  }
  const lip = hexToRgb(makeup.lipHex);
  const cheek = hexToRgb(makeup.cheekHex);
  const eye = hexToRgb(makeup.eyeHex || makeup.cheekHex);
  const s = makeup.strength;
  const cheekY = makeup.cheekHeight ?? 0.43;
  const d = imgData.data;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const face = faceMaskWeight(x, y, w, h);
      if (face < 0.05) continue;
      const i = (y * w + x) * 4;
      let r = d[i];
      let g = d[i + 1];
      let b = d[i + 2];

      const ny = y / h;
      if (ny > 0.62 && ny < 0.82 && Math.abs(x / w - 0.5) < 0.14) {
        const lipW = face * s * 1.1;
        r = r * (1 - lipW) + lip.r * lipW;
        g = g * (1 - lipW) + lip.g * lipW;
        b = b * (1 - lipW) + lip.b * lipW;
      }
      if (ny > cheekY - 0.06 && ny < cheekY + 0.1) {
        const cx = x / w;
        if (cx < 0.42 || cx > 0.58) {
          const ck = face * s * 0.85;
          r = r * (1 - ck) + cheek.r * ck;
          g = g * (1 - ck) + cheek.g * ck;
          b = b * (1 - ck) + cheek.b * ck;
        }
      }
      if (ny > 0.34 && ny < 0.52 && Math.abs(x / w - 0.5) < 0.22) {
        const ew = face * s * 0.45;
        r = r * (1 - ew) + eye.r * ew;
        g = g * (1 - ew) + eye.g * ew;
        b = b * (1 - ew) + eye.b * ew;
      }

      d[i] = r;
      d[i + 1] = g;
      d[i + 2] = b;
    }
  }
  ctx.putImageData(imgData, 0, 0);
  applyMakeupOverlay(ctx, w, h, makeup);
}

function applyMakeupOverlay(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  makeup: NonNullable<LookPreset["makeup"]>
) {
  const lip = hexToRgb(makeup.lipHex);
  const cheek = hexToRgb(makeup.cheekHex);
  const s = makeup.strength;
  const cheekY = h * (makeup.cheekHeight ?? 0.43);

  ctx.globalCompositeOperation = "soft-light";
  const cheekGrad = (cx: number) => {
    const g = ctx.createRadialGradient(cx, cheekY, 0, cx, cheekY, w * 0.22);
    g.addColorStop(0, `rgba(${cheek.r},${cheek.g},${cheek.b},${s})`);
    g.addColorStop(1, "rgba(0,0,0,0)");
    return g;
  };
  ctx.fillStyle = cheekGrad(w * 0.26);
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = cheekGrad(w * 0.74);
  ctx.fillRect(0, 0, w, h);

  ctx.globalCompositeOperation = "multiply";
  const lipG = ctx.createRadialGradient(w * 0.5, h * 0.74, 0, w * 0.5, h * 0.74, w * 0.16);
  lipG.addColorStop(0, `rgba(${lip.r},${lip.g},${lip.b},${Math.min(1, s * 1.2)})`);
  lipG.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = lipG;
  ctx.fillRect(0, 0, w, h);
  ctx.globalCompositeOperation = "source-over";
}

function applyFashionMasked(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  overlay: NonNullable<LookPreset["fashionOverlay"]>
) {
  let imgData: ImageData;
  try {
    imgData = ctx.getImageData(0, 0, w, h);
  } catch {
    applyFashionOverlay(ctx, w, h, overlay);
    return;
  }
  const top = hexToRgb(overlay.topHex);
  const accent = hexToRgb(overlay.accentHex || overlay.topHex);
  const power = overlay.strength;
  const d = imgData.data;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const mask = bodyMaskWeight(x, y, w, h);
      if (mask < 0.08) continue;
      const i = (y * w + x) * 4;
      const blend = mask * power;
      const useAccent = y > h * 0.55;
      const tr = useAccent ? accent.r : top.r;
      const tg = useAccent ? accent.g : top.g;
      const tb = useAccent ? accent.b : top.b;
      d[i] = d[i] * (1 - blend) + tr * blend;
      d[i + 1] = d[i + 1] * (1 - blend) + tg * blend;
      d[i + 2] = d[i + 2] * (1 - blend) + tb * blend;
    }
  }
  ctx.putImageData(imgData, 0, 0);
  applyFashionOverlay(ctx, w, h, overlay);
}

function applyFashionOverlay(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  overlay: NonNullable<LookPreset["fashionOverlay"]>
) {
  const top = hexToRgb(overlay.topHex);
  const accent = hexToRgb(overlay.accentHex || overlay.topHex);
  const s = overlay.strength;
  const y0 = h * 0.4;

  const bodyGrad = ctx.createLinearGradient(0, y0, 0, h);
  bodyGrad.addColorStop(0, `rgba(${top.r},${top.g},${top.b},${s * 0.5})`);
  bodyGrad.addColorStop(0.3, `rgba(${top.r},${top.g},${top.b},${s * 0.9})`);
  bodyGrad.addColorStop(1, `rgba(${accent.r},${accent.g},${accent.b},${s})`);
  ctx.globalCompositeOperation = "color";
  ctx.fillStyle = bodyGrad;
  ctx.fillRect(0, y0, w, h - y0);
  ctx.globalCompositeOperation = "multiply";
  ctx.fillStyle = bodyGrad;
  ctx.fillRect(0, y0, w, h - y0);
  ctx.globalCompositeOperation = "source-over";
}

async function blendReferenceHint(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  refUrl: string,
  category: LookCategory
) {
  try {
    const ref = await loadImage(refUrl);
    const region =
      category === "fashion"
        ? { y: h * 0.38, hh: h * 0.62 }
        : category === "makeup"
          ? { y: h * 0.2, hh: h * 0.55 }
          : { y: 0, hh: h * 0.55 };

    ctx.save();
    ctx.globalCompositeOperation = "soft-light";
    ctx.globalAlpha = category === "fashion" ? 0.35 : 0.28;
    ctx.drawImage(ref, 0, region.y, w, region.hh, 0, region.y, w, region.hh);
    ctx.restore();
  } catch {
    /* optional */
  }
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
  const warm = filter.warmth ?? 0;

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
    r += warm * 22;
    g += warm * 10;
    b -= warm * 8;
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
    if (preset.hairTint) applyHairColorHSL(ctx, w, h, preset.hairTint);
    return;
  }

  if (cat === "hairStyle") {
    if (preset.hairTint) applyHairColorHSL(ctx, w, h, { ...preset.hairTint, strength: preset.hairTint.strength * 0.5 });
    if (preset.hairStyleEffect) applyHairStyle(ctx, w, h, preset.hairStyleEffect);
    if (preset.filter) applyColorFilter(ctx, w, h, preset.filter);
    return;
  }

  if (cat === "makeup") {
    if (preset.makeup) applyMakeupMasked(ctx, w, h, preset.makeup);
    if (preset.filter) applyColorFilter(ctx, w, h, preset.filter);
    return;
  }

  if (cat === "fashion") {
    if (preset.fashionOverlay) applyFashionMasked(ctx, w, h, preset.fashionOverlay);
    if (preset.filter) applyColorFilter(ctx, w, h, preset.filter);
    return;
  }

  if (preset.hairTint) applyHairColorHSL(ctx, w, h, preset.hairTint);
  if (preset.hairStyleEffect) applyHairStyle(ctx, w, h, preset.hairStyleEffect);
  if (preset.fashionOverlay) applyFashionMasked(ctx, w, h, preset.fashionOverlay);
  if (preset.makeup) applyMakeupMasked(ctx, w, h, preset.makeup);
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
  const maxW = 800;
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

  if (preset.fromReference) {
    await blendReferenceHint(ctx, w, h, preset.fromReference, preset.category);
  }

  try {
    return canvas.toDataURL("image/jpeg", 0.92);
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
      const imageUrl = await renderLookPreview(photoDataUrl, preset);
      out.push({ preset, imageUrl });
    } catch {
      /* skip */
    }
  }
  return out;
}
