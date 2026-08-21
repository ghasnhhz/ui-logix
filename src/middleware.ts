import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "@/i18n/routing";
import { SESSION_COOKIE, verifySession } from "@/lib/auth/session";

const handleI18n = createMiddleware(routing);

// /results, /booking and /confirmed all carry prices, and the whole gate promise
// is that a price never renders before an account exists — a hand-typed URL must
// not get around it.
const PROTECTED = ["/dashboard", "/cabinet", "/results", "/booking", "/confirmed"];

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // The Mini App carries no locale segment — Telegram supplies the language, so
  // the locale is resolved in the browser from initDataUnsafe. Left to next-intl
  // this would redirect to /en/tma and the route would never render.
  if (pathname === "/tma" || pathname.startsWith("/tma/")) return NextResponse.next();

  // Resolve the locale prefix first so an unauthenticated /ru/dashboard lands on
  // /ru/login rather than the default locale's login page.
  const [, maybeLocale, ...rest] = pathname.split("/");
  const locale = routing.locales.find((l) => l === maybeLocale);
  const routePath = locale ? `/${rest.join("/")}` : pathname;

  if (PROTECTED.some((p) => routePath === p || routePath.startsWith(`${p}/`))) {
    const session = await verifySession(
      request.cookies.get(SESSION_COOKIE)?.value
    );
    if (!session) {
      const url = request.nextUrl.clone();
      url.pathname = `/${locale ?? routing.defaultLocale}/login`;
      return NextResponse.redirect(url);
    }
  }

  return handleI18n(request);
}

export const config = {
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
