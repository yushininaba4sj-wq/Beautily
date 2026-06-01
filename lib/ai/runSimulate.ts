import type { LookPreset } from "../lookPresets";
import { isQuotaOrRateLimitError, toUserSimulateError } from "../simulateErrors";
import { buildSimulatePrompt } from "../simulatePrompt";
import { geminiEditImage, GeminiQuotaError } from "./geminiImage";
import {
  replicateCreatePrediction,
  replicateEditImage,
  replicateGetPrediction,
} from "./replicateKontext";

export type SimulateProvider = "gemini" | "replicate";

export type SimulateStartResult =
  | { mode: "done"; imageDataUrl: string; provider: SimulateProvider }
  | { mode: "poll"; predictionId: string; provider: "replicate" };

export function getSimulateProviders(): {
  gemini: boolean;
  replicate: boolean;
} {
  return {
    gemini: Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY),
    replicate: Boolean(process.env.REPLICATE_API_TOKEN),
  };
}

function geminiKey(): string | null {
  return process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || null;
}

async function runReplicate(
  photoDataUrl: string,
  prompt: string
): Promise<SimulateStartResult> {
  const replicateToken = process.env.REPLICATE_API_TOKEN;
  if (!replicateToken) throw new Error("SIMULATE_NOT_CONFIGURED");

  try {
    const imageDataUrl = await replicateEditImage(
      replicateToken,
      photoDataUrl,
      prompt,
      55000
    );
    return { mode: "done", imageDataUrl, provider: "replicate" };
  } catch (e) {
    if (e instanceof Error && e.message === "REPLICATE_TIMEOUT") {
      const predictionId = await replicateCreatePrediction(
        replicateToken,
        photoDataUrl,
        prompt
      );
      return { mode: "poll", predictionId, provider: "replicate" };
    }
    throw e;
  }
}

export async function runSimulateEdit(
  photoDataUrl: string,
  preset: LookPreset,
  referenceDataUrl?: string
): Promise<SimulateStartResult> {
  const prompt = buildSimulatePrompt(preset, {
    hasReference: Boolean(referenceDataUrl),
  });

  const gemini = geminiKey();
  const hasReplicate = Boolean(process.env.REPLICATE_API_TOKEN);

  if (gemini) {
    try {
      const imageDataUrl = await geminiEditImage(
        gemini,
        photoDataUrl,
        prompt,
        referenceDataUrl
      );
      return { mode: "done", imageDataUrl, provider: "gemini" };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      const quotaHit =
        e instanceof GeminiQuotaError || isQuotaOrRateLimitError(msg);

      if (quotaHit && hasReplicate) {
        return runReplicate(photoDataUrl, prompt);
      }

      if (quotaHit) {
        throw new Error(toUserSimulateError(msg));
      }
      throw new Error(toUserSimulateError(msg));
    }
  }

  if (hasReplicate) {
    return runReplicate(photoDataUrl, prompt);
  }

  throw new Error("SIMULATE_NOT_CONFIGURED");
}

export async function pollSimulateEdit(
  predictionId: string
): Promise<
  | { status: "processing" }
  | { status: "done"; imageDataUrl: string }
  | { status: "failed"; error: string }
> {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) throw new Error("SIMULATE_NOT_CONFIGURED");

  const result = await replicateGetPrediction(token, predictionId);

  if (result.status === "succeeded" && result.imageUrl) {
    const imgRes = await fetch(result.imageUrl);
    if (!imgRes.ok) {
      return { status: "failed", error: "生成画像の取得に失敗しました" };
    }
    const buf = Buffer.from(await imgRes.arrayBuffer());
    const mime = imgRes.headers.get("content-type") || "image/jpeg";
    return {
      status: "done",
      imageDataUrl: `data:${mime};base64,${buf.toString("base64")}`,
    };
  }

  if (result.status === "failed") {
    return { status: "failed", error: result.error || "生成に失敗しました" };
  }

  return { status: "processing" };
}
