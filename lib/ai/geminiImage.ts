const GEMINI_MODELS = [
  "gemini-2.5-flash-image",
  "gemini-2.0-flash-preview-image-generation",
  "gemini-3.1-flash-image",
] as const;

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

  let lastError = "Gemini image generation failed";

  for (const model of GEMINI_MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const json = (await res.json()) as { error?: { message?: string } };

    if (!res.ok) {
      lastError = json.error?.message || `Gemini ${model}: HTTP ${res.status}`;
      if (res.status === 404 || res.status === 400) continue;
      throw new Error(lastError);
    }

    const image = extractImageFromResponse(json);
    if (image) return image;

    lastError = `Gemini ${model} returned no image`;
  }

  throw new Error(lastError);
}
