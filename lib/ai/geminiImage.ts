import { isQuotaOrRateLimitError } from "../simulateErrors";

/** 2.5 preview は無料枠が枯渇しやすいため後回し */
const DEFAULT_GEMINI_MODELS = [
  "gemini-2.0-flash-preview-image-generation",
  "gemini-3.1-flash-image",
  "gemini-2.5-flash-image",
] as const;

function getGeminiModels(): string[] {
  const override = process.env.GEMINI_IMAGE_MODEL?.trim();
  if (override) return [override];
  return [...DEFAULT_GEMINI_MODELS];
}

function parseDataUrl(dataUrl: string): { mimeType: string; data: string } {
  const m = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!m) throw new Error("画像データの形式が不正です");
  return { mimeType: m[1], data: m[2] };
}

function extractImageFromResponse(json: unknown): string | null {
  const candidates = (json as { candidates?: unknown[] })?.candidates;
  if (!Array.isArray(candidates)) return null;
  for (const c of candidates) {
    const parts = (c as { content?: { parts?: unknown[] } })?.content?.parts;
    if (!Array.isArray(parts)) continue;
    for (const part of parts) {
      const inline =
        (part as { inlineData?: { mimeType?: string; data?: string } })?.inlineData ||
        (part as { inline_data?: { mime_type?: string; data?: string } })?.inline_data;
      if (inline?.data) {
        const mime =
          (inline as { mimeType?: string }).mimeType ||
          (inline as { mime_type?: string }).mime_type ||
          "image/png";
        return `data:${mime};base64,${inline.data}`;
      }
    }
  }
  return null;
}

function shouldTryNextModel(status: number, message: string): boolean {
  if (status === 404 || status === 400) return true;
  if (status === 429) return true;
  if (status === 403 && isQuotaOrRateLimitError(message)) return true;
  if (isQuotaOrRateLimitError(message)) return true;
  return false;
}

export class GeminiQuotaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GeminiQuotaError";
  }
}

export async function geminiEditImage(
  apiKey: string,
  photoDataUrl: string,
  prompt: string,
  referenceDataUrl?: string
): Promise<string> {
  const photo = parseDataUrl(photoDataUrl);
  const parts: Record<string, unknown>[] = [
    { text: prompt },
    { inline_data: { mime_type: photo.mimeType, data: photo.data } },
  ];

  if (referenceDataUrl) {
    const ref = parseDataUrl(referenceDataUrl);
    parts.push({
      text: "Reference style image — match its hair/makeup/fashion colors and mood on the person above:",
    });
    parts.push({ inline_data: { mime_type: ref.mimeType, data: ref.data } });
  }

  const body = {
    contents: [{ role: "user", parts }],
    generationConfig: {
      responseModalities: ["TEXT", "IMAGE"],
    },
  };

  const models = getGeminiModels();
  let lastError = "Gemini image generation failed";
  let sawQuota = false;

  for (const model of models) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const json = (await res.json()) as { error?: { message?: string; status?: string } };

    if (!res.ok) {
      lastError = json.error?.message || `Gemini ${model}: HTTP ${res.status}`;
      if (isQuotaOrRateLimitError(lastError)) sawQuota = true;
      if (shouldTryNextModel(res.status, lastError)) continue;
      throw new Error(lastError);
    }

    const image = extractImageFromResponse(json);
    if (image) return image;

    lastError = `Gemini ${model} returned no image`;
  }

  if (sawQuota) {
    throw new GeminiQuotaError(lastError);
  }
  throw new Error(lastError);
}
