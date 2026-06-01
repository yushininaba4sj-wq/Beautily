const KONTEXT_MODEL =
  process.env.REPLICATE_KONTEXT_MODEL || "black-forest-labs/flux-kontext-max";

type Prediction = {
  id: string;
  status: string;
  output?: string | string[] | null;
  error?: string | null;
};

async function replicateFetch(
  token: string,
  path: string,
  init?: RequestInit
): Promise<Prediction> {
  const res = await fetch(`https://api.replicate.com/v1${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init?.headers as Record<string, string>),
    },
  });
  const json = (await res.json()) as Prediction & { detail?: string };
  if (!res.ok) {
    throw new Error(json.detail || json.error || `Replicate HTTP ${res.status}`);
  }
  return json;
}

async function uploadDataUrl(token: string, dataUrl: string): Promise<string> {
  const m = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!m) throw new Error("画像データの形式が不正です");
  const mime = m[1];
  const buf = Buffer.from(m[2], "base64");

  const res = await fetch("https://api.replicate.com/v1/files", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": mime,
    },
    body: buf,
  });

  if (res.ok) {
    const json = (await res.json()) as { urls?: { get?: string } };
    if (json.urls?.get) return json.urls.get;
  }

  return dataUrl;
}

function outputToUrl(output: Prediction["output"]): string | null {
  if (!output) return null;
  if (typeof output === "string") return output;
  if (Array.isArray(output) && output[0]) return String(output[0]);
  return null;
}

export async function replicateCreatePrediction(
  token: string,
  photoDataUrl: string,
  prompt: string
): Promise<string> {
  const inputImage = await uploadDataUrl(token, photoDataUrl);

  const pred = await replicateFetch(token, `/models/${KONTEXT_MODEL}/predictions`, {
    method: "POST",
    body: JSON.stringify({
      input: {
        prompt,
        input_image: inputImage,
        aspect_ratio: "match_input_image",
        output_format: "jpg",
        safety_tolerance: 2,
      },
    }),
  });

  return pred.id;
}

export async function replicateGetPrediction(
  token: string,
  predictionId: string
): Promise<{ status: "starting" | "processing" | "succeeded" | "failed"; imageUrl?: string; error?: string }> {
  const pred = await replicateFetch(token, `/predictions/${predictionId}`);

  if (pred.status === "succeeded") {
    const url = outputToUrl(pred.output);
    if (!url) return { status: "failed", error: "出力画像がありません" };
    return { status: "succeeded", imageUrl: url };
  }

  if (pred.status === "failed" || pred.status === "canceled") {
    return { status: "failed", error: pred.error || "生成に失敗しました" };
  }

  return {
    status: pred.status === "starting" ? "starting" : "processing",
  };
}

export async function replicateEditImage(
  token: string,
  photoDataUrl: string,
  prompt: string,
  maxWaitMs = 90000
): Promise<string> {
  const id = await replicateCreatePrediction(token, photoDataUrl, prompt);
  const started = Date.now();

  while (Date.now() - started < maxWaitMs) {
    await new Promise((r) => setTimeout(r, 1500));
    const result = await replicateGetPrediction(token, id);
    if (result.status === "succeeded" && result.imageUrl) {
      const imgRes = await fetch(result.imageUrl);
      if (!imgRes.ok) throw new Error("生成画像の取得に失敗しました");
      const buf = Buffer.from(await imgRes.arrayBuffer());
      const mime = imgRes.headers.get("content-type") || "image/jpeg";
      return `data:${mime};base64,${buf.toString("base64")}`;
    }
    if (result.status === "failed") {
      throw new Error(result.error || "Replicate generation failed");
    }
  }

  throw new Error("REPLICATE_TIMEOUT");
}
