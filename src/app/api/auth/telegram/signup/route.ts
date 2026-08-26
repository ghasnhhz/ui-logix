import { fail, failValidation, ok } from "@/lib/api";
import { setSessionCookie } from "@/lib/auth/server";
import { verifyInitData } from "@/lib/auth/telegram";
import { syntheticEmail } from "@/lib/auth/telegram-email";
import { prisma } from "@/lib/db";
import { telegramSignupSchema } from "@/lib/validation/auth";

const SELECT = { id: true, email: true, company: true, phone: true } as const;

export async function POST(request: Request) {
  const parsed = telegramSignupSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return failValidation(parsed.error);

  const botToken = process.env.BOT_TOKEN;
  if (!botToken) return fail("Telegram sign-in is not configured", 500);

  const { initData, company, phone } = parsed.data;

  // The telegramId that reaches the database comes from this check and nowhere
  // else. `initDataUnsafe` on the client is the same payload unverified, and a
  // client-asserted id is not an identity.
  const verified = verifyInitData(initData, botToken);
  if (!verified.ok) return fail("Invalid Telegram sign-in", 401, undefined, "telegramRejected");

  const { telegramId } = verified.identity;

  // A second submit from the same verified user signs them in rather than
  // failing (D-056): the identity is proven, so it is the same person tapping
  // twice, and a 409 would strand them beside an account they cannot reach.
  const existing = await prisma.user.findUnique({ where: { telegramId }, select: SELECT });
  const user =
    existing ??
    (await prisma.user.create({
      // No password — a Telegram account authenticates by signed initData (D-046).
      data: { telegramId, email: syntheticEmail(telegramId), company, phone },
      select: SELECT,
    }));

  await setSessionCookie(user.id, user.email);
  return ok(user, existing ? 200 : 201);
}
