import { jwtVerify, SignJWT } from "jose";

export const SESSION_COOKIE = "ulx_session";

const ALG = "HS256";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export type SessionPayload = { sub: string; email: string };

// Resolved on first use, not at module load: the middleware module is evaluated
// during `next build`, and a throw there would fail builds in any environment
// that only supplies secrets at runtime.
function secret() {
  const value = process.env.JWT_SECRET;
  if (!value || value.length < 32) {
    throw new Error("JWT_SECRET is missing or shorter than 32 bytes");
  }
  return new TextEncoder().encode(value);
}

export function signSession(payload: SessionPayload) {
  return new SignJWT({ email: payload.email })
    .setProtectedHeader({ alg: ALG })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(secret());
}

export async function verifySession(
  token: string | undefined
): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: [ALG] });
    if (!payload.sub || typeof payload.email !== "string") return null;
    return { sub: payload.sub, email: payload.email };
  } catch {
    return null;
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: MAX_AGE_SECONDS,
} as const;
