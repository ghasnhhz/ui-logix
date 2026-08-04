import { fail, failValidation, ok } from "@/lib/api";
import { verifyPassword } from "@/lib/auth/password";
import { setSessionCookie } from "@/lib/auth/server";
import { prisma } from "@/lib/db";
import { loginSchema } from "@/lib/validation/auth";

export async function POST(request: Request) {
  const parsed = loginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return failValidation(parsed.error);

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });

  // One message for both branches — telling an attacker which emails exist is
  // free account enumeration.
  if (!user || !(await verifyPassword(password, user.password))) {
    return fail("Incorrect email or password", 401);
  }

  await setSessionCookie(user.id, user.email);
  return ok({
    id: user.id,
    email: user.email,
    company: user.company,
    phone: user.phone,
  });
}
