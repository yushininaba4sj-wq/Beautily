import type { LookPreset } from "../lookPresets";
import { buildSimulatePrompt } from "../simulatePrompt";
import { geminiEditImage } from "./geminiImage";
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

export async function runSimulateEdit(
  photoDataUrl: string,
  preset: LookPreset,
  referenceDataUrl?: string
): Promise<SimulateStartResult> {
  const prompt = buildSimulatePrompt(preset, {
    hasReference: Boolean(referenceDataUrl),
  });

  const gemini = geminiKey();
  if (gemini) {
    const imageDataUrl = await geminiEditImage(
      gemini,
      photoDataUrl,
      prompt,
      referenceDataUrl
    );
    return { mode: "done", imageDataUrl, provider: "gemini" };
  }

  const replicateToken = process.env.REPLICATE_API_TOKEN;
  if (replicateToken) {
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
