import { post, type ApiResult } from "./api-client";
import type { Quote } from "@/lib/pricing";
import type { WizardSpec } from "@/lib/wizard/spec";

/** `results` is what was persisted, not a second derivation of it (D-055). */
export type CreatedQuote = { id: string; reference: string; results: Quote[] };

// MASTER.md § 3 keeps the rate fetch at 1600ms. The real round trip is usually
// quicker, so this is a floor rather than an added delay — the spinner has to
// last long enough for "querying six carriers" to read as work being done.
const MIN_FETCH_MS = 1600;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function createQuote(
  spec: WizardSpec,
  fallback: string,
  minMs: number = MIN_FETCH_MS,
): Promise<ApiResult<CreatedQuote>> {
  const [result] = await Promise.all([
    post<CreatedQuote>("/api/quotes", spec, fallback),
    sleep(minMs),
  ]);
  return result;
}
