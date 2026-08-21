import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { IBM_Plex_Mono, Manrope, Plus_Jakarta_Sans } from "next/font/google";
import "../globals.css";

// The three families are declared again rather than imported from the web
// layout: `src/app/[locale]/` is Phase 1 code and stays untouched. next/font
// dedupes identical requests at build time, so this costs nothing.
const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
});

// Plus Jakarta Sans has no `cyrillic` subset — Manrope sits behind it so ru
// renders in a matching sans instead of a system fallback (D-014).
const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin", "latin-ext", "cyrillic"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "U Logix",
  description: "Compare freight rates across six carriers and book from Telegram.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // iOS zooms the webview when a field under 16px takes focus and never zooms
  // back out, which strands the user mid-wizard. Fields are sized at 16px so
  // nothing here needs pinch-zoom to read.
  maximumScale: 1,
  userScalable: false,
  // Telegram draws behind the home indicator; the frame pads from safeAreaInset.
  viewportFit: "cover",
  themeColor: "#16233F",
};

// No locale segment: Telegram supplies the language and it is only knowable in
// the browser, so `lang` starts at the default and the messages provider
// corrects it. `translate="no"` for the same reason as the web layout — Chrome
// rewrites the DOM before hydration when it thinks the page needs translating.
export default function TmaLayout({ children }: { children: React.ReactNode }) {
  return (
    // telegram-web-app.js writes its own --tg-viewport-* variables onto <html>
    // before React hydrates, which React then reports as a mismatch. The
    // suppression is scoped to this element's attributes; children still warn.
    <html lang="en" translate="no" suppressHydrationWarning>
      <body
        className={`${jakarta.variable} ${manrope.variable} ${plexMono.variable} bg-navy`}
      >
        <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
        {children}
      </body>
    </html>
  );
}
