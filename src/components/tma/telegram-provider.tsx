"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { bootstrap, isMock, readViewport, webApp, type Viewport } from "@/lib/tma/telegram";
import type { TelegramUser, TelegramWebApp } from "@/lib/tma/types";

type Status = "loading" | "ready" | "unavailable";

type TelegramValue = {
  app: TelegramWebApp | null;
  status: Status;
  user: TelegramUser | undefined;
  viewport: Viewport;
  mock: boolean;
};

const FALLBACK_VIEWPORT: Viewport = { stableHeight: 0, safeTop: 0, safeBottom: 0 };

const TelegramContext = createContext<TelegramValue>({
  app: null,
  status: "loading",
  user: undefined,
  viewport: FALLBACK_VIEWPORT,
  mock: false,
});

export const useTelegram = () => useContext(TelegramContext);

// The SDK is a third-party script: `beforeInteractive` usually wins the race
// against hydration, but a cold cache on a slow connection does not guarantee
// it. Waiting is cheaper than being wrong about it.
const WAIT_MS = 2000;
const POLL_MS = 50;

async function waitForWebApp() {
  for (let waited = 0; waited < WAIT_MS; waited += POLL_MS) {
    const app = webApp();
    if (app) return app;
    await new Promise((resolve) => setTimeout(resolve, POLL_MS));
  }
  return null;
}

export function TelegramProvider({ children }: { children: React.ReactNode }) {
  const [value, setValue] = useState<TelegramValue>({
    app: null,
    status: "loading",
    user: undefined,
    viewport: FALLBACK_VIEWPORT,
    mock: false,
  });

  useEffect(() => {
    let cancelled = false;
    let app: TelegramWebApp | null = null;
    const sync = () => {
      if (app && !cancelled) {
        setValue((current) => ({ ...current, viewport: readViewport(app!) }));
      }
    };

    (async () => {
      app = await waitForWebApp();

      // D-050. Telegram will not load localhost, so development gets a stub.
      // It leaves initData empty and sets no cookie — it cannot authenticate.
      if (!app && process.env.NODE_ENV !== "production") {
        const { installMock } = await import("@/lib/tma/mock");
        installMock();
        app = webApp();
      }

      if (cancelled) return;
      if (!app) {
        setValue((current) => ({ ...current, status: "unavailable" }));
        return;
      }

      bootstrap(app);
      setValue({
        app,
        status: "ready",
        user: app.initDataUnsafe.user,
        viewport: readViewport(app),
        mock: isMock(),
      });

      app.onEvent("viewportChanged", sync);
      app.onEvent("safeAreaChanged", sync);
      app.onEvent("contentSafeAreaChanged", sync);
    })();

    return () => {
      cancelled = true;
      app?.offEvent("viewportChanged", sync);
      app?.offEvent("safeAreaChanged", sync);
      app?.offEvent("contentSafeAreaChanged", sync);
    };
  }, []);

  return <TelegramContext.Provider value={value}>{children}</TelegramContext.Provider>;
}
