import { NextResponse } from "next/server";
import type { ZodError } from "zod";
import { issueCode, type ErrorCode } from "@/lib/validation/error-codes";

// ARCHITECTURE.md § API: every handler returns { data } or { error }.
export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status });
}

// `code` is the stable, localisable half of an error. `message` stays English and
// is only ever a developer's fallback — a client that renders it verbatim is a
// bug, because zod's own strings are not translated.
export function fail(message: string, status = 400, field?: string, code?: ErrorCode) {
  return NextResponse.json({ error: { message, field, code } }, { status });
}

export function failValidation(error: ZodError) {
  const issue = error.issues[0];
  return fail(issue.message, 422, issue.path.join("."), issueCode(issue));
}
