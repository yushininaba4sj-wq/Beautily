import type { LookPreset } from "./lookPresets";

export type SimulateApiResult =
  | {
      mode: "done";
      imageDataUrl: string;
      provider: string;
      warning?: string;
    }
  | { mode: "poll"; predictionId: string; provider: string };

export async function fetchSimulateProviders(): Promise<{
  configured: boolean;
  providers: { gemini: boolean; replicate: boolean };
}> {
  const res = await fetch("/api/simulate");
  if (!res.ok) return { configured: false, providers: { gemini: false, replicate: false } };
  return res.json();
}

export async function requestSimulateEdit(
  photoDataUrl: string,
  preset: LookPreset,
  options?: { referenceDataUrl?: string; allowFallback?: boolean }
): Promise<SimulateApiResult> {
  const res = await fetch("/api/simulate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      photoDataUrl,
      preset,
      referenceDataUrl: options?.referenceDataUrl,
      allowFallback: options?.allowFallback ?? false,
    }),
  });

  const json = (await res.json()) as SimulateApiResult & {
    error?: string;
    message?: string;
  };

  if (!res.ok) {
    if (json.error === "SIMULATE_NOT_CONFIGURED") {
      throw new Error(json.message || "APIキーが未設定です");
    }
    throw new Error(json.error || json.message || "生成に失敗しました");
  }

  return json;
}

export async function pollSimulateEdit(predictionId: string): Promise<SimulateApiResult> {
  const res = await fetch("/api/simulate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ predictionId }),
  });

  const json = (await res.json()) as SimulateApiResult & { error?: string };

  if (!res.ok) {
    throw new Error(json.error || "ポーリングに失敗しました");
  }

  return json;
}

export async function runSimulateWithPolling(
  photoDataUrl: string,
  preset: LookPreset,
  options?: {
    referenceDataUrl?: string;
    onProgress?: (msg: string) => void;
    maxPolls?: number;
  }
): Promise<{ imageDataUrl: string; provider: string; warning?: string }> {
  options?.onProgress?.("美容プロデューサーが仕上げ中…");

  let result = await requestSimulateEdit(photoDataUrl, preset, {
    referenceDataUrl: options?.referenceDataUrl,
    allowFallback: false,
  });

  const maxPolls = options?.maxPolls ?? 60;
  let polls = 0;

  while (result.mode === "poll" && polls < maxPolls) {
    polls += 1;
    options?.onProgress?.(`仕上げ中… (${polls * 2}秒)`);
    await new Promise((r) => setTimeout(r, 2000));
    result = await pollSimulateEdit(result.predictionId);
  }

  if (result.mode === "poll") {
    throw new Error("生成がタイムアウトしました。もう一度お試しください。");
  }

  return {
    imageDataUrl: result.imageDataUrl,
    provider: result.provider,
    warning: result.warning,
  };
}
