import { fail, ok } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/server";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return fail("Not authenticated", 401);
  return ok(user);
}
