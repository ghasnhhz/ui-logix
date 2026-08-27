import type { ErrorCode } from "@/lib/validation/error-codes";

// `message` is the handler's English text and only a last resort — anything with
// a `code` renders through the `errors` namespace instead (see form-error.ts).
export type ApiError = { message: string; field?: string; code?: ErrorCode };
export type ApiResult<T> = { data: T } | { error: ApiError };

export const isError = <T>(result: ApiResult<T>): result is { error: ApiError } =>
  "error" in result;

// Handlers answer { data } or { error } (ARCHITECTURE.md § API). `fallback` is
// the localised message for a response that is neither — a network drop or a
// crash before the handler ran.
export async function post<T>(
  path: string,
  body: unknown,
  fallback: string,
): Promise<ApiResult<T>> {
  try {
    const response = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const payload = await response.json().catch(() => null);

    if (!response.ok) return { error: payload?.error ?? { message: fallback } };
    return { data: payload.data as T };
  } catch {
    return { error: { message: fallback } };
  }
}

// Same envelope, same fallback rule as `post`. Reads are always same-origin, so
// the session cookie rides along without asking for it.
export async function get<T>(path: string, fallback: string): Promise<ApiResult<T>> {
  try {
    const response = await fetch(path);
    const payload = await response.json().catch(() => null);

    if (!response.ok) return { error: payload?.error ?? { message: fallback } };
    return { data: payload.data as T };
  } catch {
    return { error: { message: fallback } };
  }
}
