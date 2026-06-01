export function isQuotaOrRateLimitError(message: string): boolean {
  const m = message.toLowerCase();
  return (
    m.includes("quota exceeded") ||
    m.includes("resource_exhausted") ||
    m.includes("rate limit") ||
    m.includes("rate-limit") ||
    m.includes("too many requests") ||
    m.includes("limit: 0")
  );
}

export function parseRetrySeconds(message: string): number | null {
  const m = message.match(/retry in ([\d.]+)s/i);
  if (!m) return null;
  return Math.ceil(parseFloat(m[1]));
}

export function toUserSimulateError(raw: string): string {
  if (isQuotaOrRateLimitError(raw)) {
    const sec = parseRetrySeconds(raw);
    const wait = sec ? `約${sec}秒後に` : "しばらくしてから";
    return (
      `Gemini の無料枠の上限に達しました。${wait}もう一度お試しください。\n` +
      `毎日の上限の場合は翌日まで待つか、Google AI Studio で課金（Pay-as-you-go）を有効にしてください。\n` +
      `https://ai.google.dev/gemini-api/docs/rate-limits`
    );
  }
  if (raw.includes("API key not valid") || raw.includes("API_KEY_INVALID")) {
    return "APIキーが無効です。Vercel の GEMINI_API_KEY を確認してください。";
  }
  return raw.length > 280 ? `${raw.slice(0, 280)}…` : raw;
}
