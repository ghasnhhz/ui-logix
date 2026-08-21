"use client";

import { TmaAppProvider, useTmaApp } from "./app-provider";
import { MessagesProvider } from "./messages-provider";
import { ScaffoldScreen } from "./screens/scaffold-screen";
import { ScreenFrame } from "./screen-frame";
import { TelegramProvider, useTelegram } from "./telegram-provider";
import { Unavailable } from "./unavailable";

export function MiniApp() {
  return (
    <TelegramProvider>
      <Shell />
    </TelegramProvider>
  );
}

function Shell() {
  const { status, user } = useTelegram();

  // Nothing renders until the SDK has answered and the locale is known —
  // Telegram's own splash is still up, and a first paint in the wrong language
  // is worse than a beat of nothing.
  return (
    <MessagesProvider languageCode={user?.language_code}>
      {status === "unavailable" ? (
        <Unavailable />
      ) : (
        <TmaAppProvider>
          <Screens />
        </TmaAppProvider>
      )}
    </MessagesProvider>
  );
}

function Screens() {
  const { state } = useTmaApp();

  return (
    <ScreenFrame>
      <ScaffoldScreen
        name={state.screen}
        step={state.screen === "wizard" ? state.step : undefined}
      />
    </ScreenFrame>
  );
}
