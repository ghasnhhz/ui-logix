import { fail, failValidation, ok } from "@/lib/api";
import { hashPassword } from "@/lib/auth/password";
import { setSessionCookie } from "@/lib/auth/server";
import { prisma } from "@/lib/db";
import { signupSchema } from "@/lib/validation/auth";

export async function POST(request: Request) {
  const parsed = signupSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return failValidation(parsed.error);

  const { email, password, company, phone } = parsed.data;

  if (await prisma.user.findUnique({ where: { email }, select: { id: true } })) {
    return fail("An account with this email already exists", 409, "email");
  }

  const user = await prisma.user.create({
    data: { email, password: await hashPassword(password), company, phone },
    select: { id: true, email: true, company: true, phone: true },
  });

  await setSessionCookie(user.id, user.email);
  return ok(user, 201);
}
