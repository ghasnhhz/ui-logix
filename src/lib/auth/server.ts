import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import {
  SESSION_COOKIE,
  sessionCookieOptions,
  signSession,
  verifySession,
} from "./session";

// next/headers is unavailable in middleware, so cookie access lives here and
// session.ts stays Edge-safe for the route guard.

export async function setSessionCookie(userId: string, email: string) {
  const token = await signSession({ sub: userId, email });
  (await cookies()).set(SESSION_COOKIE, token, sessionCookieOptions);
}

export async function clearSessionCookie() {
  (await cookies()).delete(SESSION_COOKIE);
}

export async function getSession() {
  return verifySession((await cookies()).get(SESSION_COOKIE)?.value);
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;

  return prisma.user.findUnique({
    where: { id: session.sub },
    select: {
      id: true,
      email: true,
      company: true,
      phone: true,
      createdAt: true,
    },
  });
}
