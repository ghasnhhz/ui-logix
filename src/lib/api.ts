import { NextResponse } from "next/server";
import type { ZodError } from "zod";

// ARCHITECTURE.md § API: every handler returns { data } or { error }.
export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status });
}

export function fail(message: string, status = 400, field?: string) {
  return NextResponse.json({ error: { message, field } }, { status });
}

export function failValidation(error: ZodError) {
  const issue = error.issues[0];
  return fail(issue.message, 422, issue.path.join("."));
}
