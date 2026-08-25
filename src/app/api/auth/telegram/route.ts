import { fail, failValidation, ok } from "@/lib/api";
import { setSessionCookie } from "@/lib/auth/server";
import { verifyInitData } from "@/lib/auth/telegram";
import { prisma } from "@/lib/db";
import { telegramSchema } from "@/lib/validation/auth";

export async function POST(request: Request) {
  const parsed = telegramSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return failValidation(parsed.error);

  const botToken = process.env.BOT_TOKEN;
  if (!botToken) return fail("Telegram sign-in is not configured", 500);

  // One answer for a bad signature, a stale auth_date and a malformed payload.
  // Which check failed is not the caller's business, and the token is never
  // named in a response or a log line — it is the signing secret.
  const verified = verifyInitData(parsed.data.initData, botToken);
  if (!verified.ok) return fail("Invalid Telegram sign-in", 401);

  const user = await prisma.user.findUnique({
    where: { telegramId: verified.identity.telegramId },
    select: { id: true, email: true, company: true, phone: true },
  });

  // A verified Telegram user with no account is a guest until the signup sheet
  // creates one (Feature 10). No cookie, and nothing from the verified payload
  // is echoed back — the client already holds initDataUnsafe for display, and a
  // response it could keep would invite a later feature to trust it instead of
  // re-verifying.
  if (!user) return ok({ authenticated: false });

  await setSessionCookie(user.id, user.email);
  return ok({ authenticated: true, user });
}
