"use client";

import { useSyncExternalStore } from "react";
import { MOCK_CHROME_EVENT, mockChrome } from "@/lib/tma/mock";
import { useTelegram } from "./telegram-provider";

// D-050. Telegram's MainButton lives outside the webview, so a plain browser
// shows nothing at all — this draws what the mock was told to display. It never
// renders in a real client: the SDK is present there and `mock` is false.

const subscribe = (onChange: () => void) => {
  window.addEventListener(MOCK_CHROME_EVENT, onChange);
  return () => window.removeEventListener(MOCK_CHROME_EVENT, onChange);
};

// The mock mutates one object in place, so the snapshot is a cheap string of
// everything the bar renders — a new object each call would loop forever.
const snapshot = () => {
  const { main } = mockChrome();
  return [
    main.text,
    main.color,
    main.textColor,
    main.isVisible,
    main.isActive,
    main.isProgressVisible,
  ].join("|");
};

export function MockMainButtonBar() {
  const { mock } = useTelegram();
  const key = useSyncExternalStore(subscribe, snapshot, () => "");
  const { main, mainClick } = mockChrome();

  if (!mock || !main.isVisible || !key) return null;

  return (
    <div className="flex-none border-t border-dashed border-border bg-page px-3.5 pb-6 pt-2.5">
      <button
        type="button"
        disabled={!main.isActive}
        onClick={() => mainClick?.()}
        style={{ background: main.color, color: main.textColor }}
        className="flex min-h-[52px] w-full cursor-pointer items-center justify-center gap-2 rounded-[11px] px-4 text-[15px] font-bold tracking-[-0.01em] disabled:cursor-default"
      >
        {main.isProgressVisible && (
          <span className="size-[15px] animate-spin rounded-full border-2 border-current/40 border-t-current" />
        )}
        {main.text}
      </button>
    </div>
  );
}
