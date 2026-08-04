import { ok } from "@/lib/api";
import { clearSessionCookie } from "@/lib/auth/server";

export async function POST() {
  await clearSessionCookie();
  return ok({ success: true });
}
