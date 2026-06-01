import type { LookPreset } from "./lookPresets";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    // data:/blob: に crossOrigin を付けると読み込み失敗・Canvas汚染の原因になる
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

function applyHairTint(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  tint: { hex: string; strength: number }
) {
  const { r, g, b } = hexToRgb(tint.hex);
  const strength = Math.min(0.65, tint.strength * 1.15);
  const grad = ctx.createLinearGradient(0, 0, 0, h * 0.58);
  grad.addColorStop(0, `rgba(${r},${g},${b},${strength})`);
  grad.addColorStop(0.65, `rgba(${r},${g},${b},${strength * 0.4})`);
  grad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.globalCompositeOperation = "multiply";
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
  ctx.globalCompositeOperation = "soft-light";
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h * 0.52);
  ctx.globalCompositeOperation = "source-over";
}

function applyMakeup(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  makeup: { lipHex: string; cheekHex: string; strength: number }
) {
  const lip = hexToRgb(makeup.lipHex);
  const cheek = hexToRgb(makeup.cheekHex);
  const s = Math.min(0.55, makeup.strength * 1.2);

  ctx.globalCompositeOperation = "soft-light";

  const cheekGrad = (cx: number) => {
    const g = ctx.createRadialGradient(cx, h * 0.52, 0, cx, h * 0.52, w * 0.24);
    g.addColorStop(0, `rgba(${cheek.r},${cheek.g},${cheek.b},${s})`);
    g.addColorStop(1, "rgba(0,0,0,0)");
    return g;
  };
  ctx.fillStyle = cheekGrad(w * 0.28);
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = cheekGrad(w * 0.72);
  ctx.fillRect(0, 0, w, h);

  const lipG = ctx.createRadialGradient(w * 0.5, h * 0.72, 0, w * 0.5, h * 0.72, w * 0.2);
  lipG.addColorStop(0, `rgba(${lip.r},${lip.g},${lip.b},${s * 1.15})`);
  lipG.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = lipG;
  ctx.fillRect(0, 0, w, h);

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

    r += warm * 18;
    g += warm * 8;
    b -= warm * 6;

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
  if (!photoDataUrl.startsWith("data:") && !photoDataUrl.startsWith("blob:") && !photoDataUrl.startsWith("http")) {
    throw new Error("写真データが無効です。もう一度診断してください。");
  }

  const img = await loadImage(photoDataUrl);
  const maxW = 640;
  const scale = Math.min(1, maxW / img.naturalWidth);
  const w = Math.max(1, Math.round(img.naturalWidth * scale));
  const h = Math.max(1, Math.round(img.naturalHeight * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("描画に失敗しました");

  ctx.drawImage(img, 0, 0, w, h);

  if (preset.hairTint) applyHairTint(ctx, w, h, preset.hairTint);
  if (preset.makeup) applyMakeup(ctx, w, h, preset.makeup);
  if (preset.filter) applyColorFilter(ctx, w, h, preset.filter);

  try {
    return canvas.toDataURL("image/jpeg", 0.88);
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
      /* skip failed frame */
    }
  }
  return out;
}
