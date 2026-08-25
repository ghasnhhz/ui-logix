"use client";

import dynamic from "next/dynamic";
import { showTabs } from "@/lib/tma/main-button";
import type { MainButtonAction } from "@/lib/tma/main-button";
import { TmaAppProvider, useTmaApp } from "./app-provider";
import { HeaderBar } from "./header-bar";
import { MessagesProvider } from "./messages-provider";
import { JumpBar } from "./screens/jump-bar";
import { ScaffoldScreen } from "./screens/scaffold-screen";
import { StartScreen } from "./screens/start-screen";
import { WizardScreen } from "./screens/wizard-screen";
import { ScreenFrame } from "./screen-frame";
import { TabBar } from "./tab-bar";
import { TelegramProvider, useTelegram } from "./telegram-provider";
import { Unavailable } from "./unavailable";
import { useBackButton } from "./use-back-button";
import { useMainButton } from "./use-main-button";

// Split out so the mock's in-page button bar is a chunk of its own and never
// loads in a real client (D-050).
const MockMainButtonBar = dynamic(
  () => import("./mock-chrome").then((module) => module.MockMainButtonBar),
  { ssr: false }
);

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
  const { state, dispatch } = useTmaApp();
  const { mock } = useTelegram();

  useBackButton();
  useMainButton((action: MainButtonAction) => {
    switch (action) {
      case "startWizard":
      case "newRequest":
        return dispatch({ type: "goStep", step: 1 });
      case "next":
        return dispatch({ type: "next" });
      case "getQuotes":
        // A guest is asked for an account before any price renders — the whole
        // gate promise. Features 10 and 11 own what happens after the sheet.
        return state.guest
          ? dispatch({ type: "openGate" })
          : dispatch({ type: "fetchStart" });
      case "signup":
      case "confirmBooking":
        return dispatch({ type: "closeGate" });
      case "goShips":
        return dispatch({ type: "go", screen: "ships" });
    }
  });

  const tabs = showTabs(state);
  const bleed = state.screen === "start";

  return (
    <ScreenFrame
      header={<HeaderBar />}
      footer={tabs ? <TabBar /> : mock ? <MockMainButtonBar /> : undefined}
      bleed={bleed}
    >
      {state.screen === "start" ? (
        <StartScreen />
      ) : state.screen === "wizard" ? (
        <WizardScreen />
      ) : (
        <ScaffoldScreen name={state.screen} />
      )}

      {/* The mock's jump panel needs the padding back on a bleeding screen. */}
      {mock && (
        <div className={bleed ? "px-3.5 pb-3.5" : ""}>
          <JumpBar />
        </div>
      )}
    </ScreenFrame>
  );
}
