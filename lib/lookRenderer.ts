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

/** 顔の楕円内は 0、髪エリアは 1 に近いマスク */
function hairMaskWeight(x: number, y: number, w: number, h: number): number {
  if (y > h * 0.52) return 0;
  const topBias = 1 - y / (h * 0.52);
  const cx = w * 0.5;
  const cy = h * 0.34;
  const nx = (x - cx) / (w * 0.36);
  const ny = (y - cy) / (h * 0.2);
  const faceDist = nx * nx + ny * ny;
  const faceBlock = faceDist < 1 ? Math.max(0, 1 - faceDist) * 0.92 : 0;
  return Math.max(0, Math.min(1, topBias * (1 - faceBlock)));
}

function applyHairColorPixels(
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
  const power = Math.min(1, tint.strength);
  const d = imgData.data;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const mask = hairMaskWeight(x, y, w, h);
      if (mask < 0.08) continue;
      const i = (y * w + x) * 4;
      const blend = mask * power;
      d[i] = d[i] * (1 - blend) + tr * blend;
      d[i + 1] = d[i + 1] * (1 - blend) + tg * blend;
      d[i + 2] = d[i + 2] * (1 - blend) + tb * blend;
    }
  }
  ctx.putImageData(imgData, 0, 0);
}

function applyHairTintOverlay(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  tint: { hex: string; strength: number }
) {
  const { r, g, b } = hexToRgb(tint.hex);
  const s = Math.min(0.95, tint.strength * 0.55);
  const grad = ctx.createRadialGradient(w * 0.5, h * 0.08, 0, w * 0.5, h * 0.08, w * 0.75);
  grad.addColorStop(0, `rgba(${r},${g},${b},${s})`);
  grad.addColorStop(0.55, `rgba(${r},${g},${b},${s * 0.5})`);
  grad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.globalCompositeOperation = "color";
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h * 0.55);
  ctx.globalCompositeOperation = "multiply";
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h * 0.5);
  ctx.globalCompositeOperation = "source-over";
}

function applyHairStyle(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  effect: NonNullable<LookPreset["hairStyleEffect"]>
) {
  switch (effect) {
    case "bangs": {
      const g = ctx.createLinearGradient(0, h * 0.1, 0, h * 0.32);
      g.addColorStop(0, "rgba(30,25,22,0.55)");
      g.addColorStop(0.6, "rgba(50,42,38,0.35)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.globalCompositeOperation = "multiply";
      ctx.fillStyle = g;
      ctx.fillRect(w * 0.15, 0, w * 0.7, h * 0.34);
      const shine = ctx.createLinearGradient(0, h * 0.12, 0, h * 0.22);
      shine.addColorStop(0, "rgba(255,255,255,0.12)");
      shine.addColorStop(1, "rgba(0,0,0,0)");
      ctx.globalCompositeOperation = "soft-light";
      ctx.fillStyle = shine;
      ctx.fillRect(w * 0.2, 0, w * 0.6, h * 0.28);
      break;
    }
    case "no-bangs": {
      const g = ctx.createLinearGradient(0, h * 0.08, 0, h * 0.22);
      g.addColorStop(0, "rgba(255,255,255,0.2)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.globalCompositeOperation = "screen";
      ctx.fillStyle = g;
      ctx.fillRect(w * 0.2, 0, w * 0.6, h * 0.25);
      break;
    }
    case "bob": {
      const side = (cx: number) => {
        const g = ctx.createRadialGradient(cx, h * 0.38, 0, cx, h * 0.38, w * 0.35);
        g.addColorStop(0, "rgba(40,35,30,0.25)");
        g.addColorStop(1, "rgba(0,0,0,0)");
        return g;
      };
      ctx.globalCompositeOperation = "multiply";
      ctx.fillStyle = side(w * 0.12);
      ctx.fillRect(0, h * 0.2, w * 0.4, h * 0.45);
      ctx.fillStyle = side(w * 0.88);
      ctx.fillRect(w * 0.6, h * 0.2, w * 0.4, h * 0.45);
      break;
    }
    case "long": {
      const g = ctx.createLinearGradient(0, h * 0.35, 0, h);
      g.addColorStop(0, "rgba(0,0,0,0)");
      g.addColorStop(0.3, "rgba(60,50,45,0.15)");
      g.addColorStop(1, "rgba(40,35,32,0.35)");
      ctx.globalCompositeOperation = "multiply";
      ctx.fillStyle = g;
      ctx.fillRect(0, h * 0.3, w, h * 0.7);
      const frame = ctx.createLinearGradient(0, 0, w, 0);
      frame.addColorStop(0, "rgba(30,25,22,0.2)");
      frame.addColorStop(0.15, "rgba(0,0,0,0)");
      frame.addColorStop(0.85, "rgba(0,0,0,0)");
      frame.addColorStop(1, "rgba(30,25,22,0.2)");
      ctx.fillStyle = frame;
      ctx.fillRect(0, h * 0.25, w, h * 0.6);
      break;
    }
    case "layer": {
      const g = ctx.createLinearGradient(0, h * 0.15, 0, h * 0.45);
      g.addColorStop(0, "rgba(255,255,255,0.08)");
      g.addColorStop(0.5, "rgba(0,0,0,0)");
      g.addColorStop(1, "rgba(60,50,45,0.12)");
      ctx.globalCompositeOperation = "overlay";
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h * 0.5);
      break;
    }
  }
  ctx.globalCompositeOperation = "source-over";
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
  const s = Math.min(0.88, makeup.strength);
  const cheekY = h * (makeup.cheekHeight ?? 0.44);

  ctx.globalCompositeOperation = "soft-light";

  const cheekGrad = (cx: number) => {
    const g = ctx.createRadialGradient(cx, cheekY, 0, cx, cheekY, w * 0.2);
    g.addColorStop(0, `rgba(${cheek.r},${cheek.g},${cheek.b},${s * 0.95})`);
    g.addColorStop(0.5, `rgba(${cheek.r},${cheek.g},${cheek.b},${s * 0.4})`);
    g.addColorStop(1, "rgba(0,0,0,0)");
    return g;
  };
  ctx.fillStyle = cheekGrad(w * 0.27);
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = cheekGrad(w * 0.73);
  ctx.fillRect(0, 0, w, h);

  const eyeL = ctx.createRadialGradient(w * 0.32, h * 0.4, 0, w * 0.32, h * 0.4, w * 0.14);
  eyeL.addColorStop(0, `rgba(${eye.r},${eye.g},${eye.b},${s * 0.5})`);
  eyeL.addColorStop(1, "rgba(0,0,0,0)");
  const eyeR = ctx.createRadialGradient(w * 0.68, h * 0.4, 0, w * 0.68, h * 0.4, w * 0.14);
  eyeR.addColorStop(0, `rgba(${eye.r},${eye.g},${eye.b},${s * 0.5})`);
  eyeR.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = eyeL;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = eyeR;
  ctx.fillRect(0, 0, w, h);

  const tearL = ctx.createRadialGradient(w * 0.32, h * 0.46, 0, w * 0.32, h * 0.46, w * 0.1);
  tearL.addColorStop(0, "rgba(255,255,255,0.35)");
  tearL.addColorStop(1, "rgba(0,0,0,0)");
  ctx.globalCompositeOperation = "screen";
  ctx.fillStyle = tearL;
  ctx.fillRect(0, 0, w, h);
  const tearR = ctx.createRadialGradient(w * 0.68, h * 0.46, 0, w * 0.68, h * 0.46, w * 0.1);
  tearR.addColorStop(0, "rgba(255,255,255,0.35)");
  tearR.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = tearR;
  ctx.fillRect(0, 0, w, h);

  ctx.globalCompositeOperation = "multiply";
  const lipG = ctx.createRadialGradient(w * 0.5, h * 0.74, 0, w * 0.5, h * 0.74, w * 0.14);
  lipG.addColorStop(0, `rgba(${lip.r},${lip.g},${lip.b},${Math.min(1, s * 1.1)})`);
  lipG.addColorStop(0.55, `rgba(${lip.r},${lip.g},${lip.b},${s * 0.65})`);
  lipG.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = lipG;
  ctx.fillRect(0, 0, w, h);

  ctx.globalCompositeOperation = "source-over";
}

function applyFashionOverlay(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  overlay: NonNullable<LookPreset["fashionOverlay"]>
) {
  const top = hexToRgb(overlay.topHex);
  const accent = hexToRgb(overlay.accentHex || overlay.topHex);
  const s = Math.min(0.85, overlay.strength);
  const y0 = h * 0.4;

  const bodyGrad = ctx.createLinearGradient(0, y0, 0, h);
  bodyGrad.addColorStop(0, `rgba(${top.r},${top.g},${top.b},${s * 0.35})`);
  bodyGrad.addColorStop(0.25, `rgba(${top.r},${top.g},${top.b},${s * 0.75})`);
  bodyGrad.addColorStop(0.7, `rgba(${accent.r},${accent.g},${accent.b},${s * 0.85})`);
  bodyGrad.addColorStop(1, `rgba(${accent.r},${accent.g},${accent.b},${s * 0.7})`);

  ctx.globalCompositeOperation = "multiply";
  ctx.fillStyle = bodyGrad;
  ctx.fillRect(0, y0, w, h - y0);

  ctx.globalCompositeOperation = "color";
  ctx.fillStyle = bodyGrad;
  ctx.fillRect(0, y0 + h * 0.05, w, h - y0);

  const neck = ctx.createLinearGradient(0, h * 0.38, 0, h * 0.48);
  neck.addColorStop(0, "rgba(0,0,0,0)");
  neck.addColorStop(0.5, `rgba(${accent.r},${accent.g},${accent.b},${s * 0.4})`);
  neck.addColorStop(1, "rgba(0,0,0,0)");
  ctx.globalCompositeOperation = "multiply";
  ctx.fillStyle = neck;
  ctx.fillRect(w * 0.35, h * 0.36, w * 0.3, h * 0.14);

  ctx.globalCompositeOperation = "source-over";
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
  const maxW = 720;
  const scale = Math.min(1, maxW / img.naturalWidth);
  const w = Math.max(1, Math.round(img.naturalWidth * scale));
  const h = Math.max(1, Math.round(img.naturalHeight * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("描画に失敗しました");

  ctx.drawImage(img, 0, 0, w, h);

  if (preset.hairTint) {
    applyHairColorPixels(ctx, w, h, preset.hairTint);
    applyHairTintOverlay(ctx, w, h, preset.hairTint);
  }
  if (preset.hairStyleEffect) {
    applyHairStyle(ctx, w, h, preset.hairStyleEffect);
  }
  if (preset.fashionOverlay) {
    applyFashionOverlay(ctx, w, h, preset.fashionOverlay);
  }
  if (preset.makeup) {
    applyMakeup(ctx, w, h, preset.makeup);
  }
  if (preset.filter) {
    applyColorFilter(ctx, w, h, preset.filter);
  }

  try {
    return canvas.toDataURL("image/jpeg", 0.9);
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
