"use client";

import { useTelegram } from "./telegram-provider";

/**
 * The scrolling body of every screen.
 *
 * Height comes from `viewportStableHeight` — the height with the keyboard
 * closed. `100vh` is wrong inside a Telegram webview and `100dvh` is only the
 * fallback for a browser that is not Telegram at all, where the mock runs.
 */
export function ScreenFrame({
  header,
  bottomInset = 24,
  children,
}: {
  header?: React.ReactNode;
  bottomInset?: number;
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
        style={{ paddingBottom: `${bottomInset + viewport.safeBottom}px` }}
      >
        {children}
      </div>
    </div>
  );
}
