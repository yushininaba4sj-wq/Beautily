import { NextResponse } from "next/server";
import type { LookPreset } from "@/lib/lookPresets";
import {
  getSimulateProviders,
  pollSimulateEdit,
  runSimulateEdit,
} from "@/lib/ai/runSimulate";
export const maxDuration = 120;
export const dynamic = "force-dynamic";

type SimulateBody = {
  photoDataUrl: string;
  preset: LookPreset;
  referenceDataUrl?: string;
  predictionId?: string;
  allowFallback?: boolean;
};

export async function GET() {
  const providers = getSimulateProviders();
  return NextResponse.json({
    configured: providers.gemini || providers.replicate,
    providers,
  });
}

export async function POST(req: Request) {
  let body: SimulateBody;
  try {
    body = (await req.json()) as SimulateBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.predictionId) {
    const token = process.env.REPLICATE_API_TOKEN;
    if (!token) {
      return NextResponse.json(
        { error: "SIMULATE_NOT_CONFIGURED", message: "APIキーが未設定です" },
        { status: 503 }
      );
    }
    const result = await pollSimulateEdit(body.predictionId);
    if (result.status === "processing") {
      return NextResponse.json({ mode: "poll", predictionId: body.predictionId });
    }
    if (result.status === "failed") {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
    return NextResponse.json({
      mode: "done",
      imageDataUrl: result.imageDataUrl,
      provider: "replicate",
    });
  }

  const { photoDataUrl, preset, referenceDataUrl } = body;
  if (!photoDataUrl?.startsWith("data:")) {
    return NextResponse.json({ error: "photoDataUrl required" }, { status: 400 });
  }
  if (!preset?.category) {
    return NextResponse.json({ error: "preset required" }, { status: 400 });
  }

  try {
    const result = await runSimulateEdit(photoDataUrl, preset, referenceDataUrl);
    return NextResponse.json(result);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "生成に失敗しました";

    if (msg === "SIMULATE_NOT_CONFIGURED") {
      return NextResponse.json(
        {
          error: "SIMULATE_NOT_CONFIGURED",
          message:
            "高性能シミュレーションには GEMINI_API_KEY または REPLICATE_API_TOKEN が必要です。Vercelの環境変数に設定してください。",
        },
        { status: 503 }
      );
    }

    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
