import type { TelegramWebApp } from "./types";

// MASTER.md § 1. Telegram wants hex strings, so the tokens cannot come from the
// Tailwind theme here — keep these two in step with globals.css.
export const HEADER_COLOR = "#16233F";
export const BACKGROUND_COLOR = "#F8FAFC";

export const webApp = (): TelegramWebApp | null =>
  typeof window === "undefined" ? null : window.Telegram?.WebApp ?? null;

export const isMock = () =>
  typeof window !== "undefined" && window.__ulxTmaMock === true;

// Bot API versions ship features, not the whole surface: a client on 6.0 has no
// setHeaderColor and no safe-area insets. Every optional call is gated.
const supports = (app: TelegramWebApp, version: string) => {
  try {
    return app.isVersionAtLeast(version);
  } catch {
    return false;
  }
};

/**
 * Announce the app to Telegram and claim the full viewport. Safe to call twice —
 * a re-mount in dev must not leave the webview half-initialised.
 */
export function bootstrap(app: TelegramWebApp) {
  app.ready();
  app.expand();

  if (supports(app, "6.1")) {
    app.setHeaderColor(HEADER_COLOR);
    app.setBackgroundColor(BACKGROUND_COLOR);
  }

  // Without this a downward swipe inside a scrolled screen closes the Mini App
  // on iOS, which reads as the app crashing mid-wizard.
  if (supports(app, "7.7")) app.disableVerticalSwipes?.();
}

export type Viewport = {
  stableHeight: number;
  safeTop: number;
  safeBottom: number;
};

// viewportStableHeight is the height with the keyboard closed; viewportHeight
// shrinks under it. Laying out against the stable one keeps the wizard's fields
// from jumping as the keyboard opens (TMA.md § Layout constraints).
export function readViewport(app: TelegramWebApp): Viewport {
  const safeArea = app.safeAreaInset;
  const contentSafeArea = app.contentSafeAreaInset;
  return {
    stableHeight: app.viewportStableHeight || app.viewportHeight || 0,
    safeTop: (safeArea?.top ?? 0) + (contentSafeArea?.top ?? 0),
    safeBottom: (safeArea?.bottom ?? 0) + (contentSafeArea?.bottom ?? 0),
  };
}
