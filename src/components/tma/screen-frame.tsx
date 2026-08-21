"use client";

import { useTelegram } from "./telegram-provider";

/**
 * The scrolling body of every screen, with our own chrome above and below it.
 *
 * Height comes from `viewportStableHeight` — the height with the keyboard
 * closed, so fields do not jump as it opens. `100vh` is wrong inside a Telegram
 * webview; `100dvh` is only the fallback for a browser that is not Telegram,
 * which is where the dev mock runs.
 *
 * Telegram's MainButton sits below the webview and is already excluded from
 * that height, so nothing here pads for it.
 */
export function ScreenFrame({
  header,
  footer,
  children,
}: {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
}) {
  const { viewport } = useTelegram();

  return (
    <div
      className="flex flex-col overflow-hidden bg-page"
      style={{ height: viewport.stableHeight ? `${viewport.stableHeight}px` : "100dvh" }}
    >
      {header}
      <div
        className="flex-1 overflow-y-auto px-3.5 pt-3.5"
        style={{ paddingBottom: footer ? "14px" : `${24 + viewport.safeBottom}px` }}
      >
        {children}
      </div>
      {footer}
    </div>
  );
}
