import type { ErrorCode } from "@/lib/validation/error-codes";
import type { ApiError } from "./api-client";

export type FormError = { field?: string; message: string };

type Options = {
  /** The input names this form actually renders. */
  fields: readonly string[];
  /** `useTranslations("errors")`. */
  t: (code: ErrorCode) => string;
  /** Shown when the failing field belongs to another screen. */
  foreign: string;
};

// A handler can name a field this form does not own: the gate submits the account
// and the shipment together, so a cleared weight comes back as `field: "weight"`
// with no input to attach it to. Those become form-level and point at the screen
// that owns the value, rather than rendering an unplaceable error.
export function resolveError(
  error: ApiError | null,
  { fields, t, foreign }: Options,
): FormError | null {
  if (!error) return null;
  if (!error.code) return { message: error.message };

  if (error.field && !fields.includes(error.field)) return { message: foreign };
  return { field: error.field, message: t(error.code) };
}

export const fieldError = (resolved: FormError | null, name: string) =>
  resolved?.field === name ? resolved.message : undefined;
