"use client";

import dynamic from "next/dynamic";
import { showTabs } from "@/lib/tma/main-button";
import type { MainButtonAction } from "@/lib/tma/main-button";
import { TmaAppProvider, useTmaApp } from "./app-provider";
import { GateSheet } from "./gate-sheet";
import { HeaderBar } from "./header-bar";
import { MessagesProvider } from "./messages-provider";
import { DoneScreen } from "./screens/done-screen";
import { HomeScreen } from "./screens/home-screen";
import { ResultsScreen } from "./screens/results-screen";
import { StartScreen } from "./screens/start-screen";
import { WizardScreen } from "./screens/wizard-screen";
import { ScreenFrame } from "./screen-frame";
import { ShipsScreen } from "./screens/ships-screen";
import { ToastHost } from "./toast-host";
import { TabBar } from "./tab-bar";
import { TelegramProvider, useTelegram } from "./telegram-provider";
import { Unavailable } from "./unavailable";
import { useBackButton } from "./use-back-button";
import { useMainButton } from "./use-main-button";
import { useBooking } from "./use-booking";
import { useQuoteFlow } from "./use-quote-flow";

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
  const flow = useQuoteFlow();
  const booking = useBooking();

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
        // gate promise.
        return state.guest ? dispatch({ type: "openGate" }) : void flow.startFetch();
      case "signup":
        return void flow.submitSignup();
      case "confirmBooking":
        return void booking.confirmBooking();
      case "goShips":
        return dispatch({ type: "go", screen: "ships" });
    }
  });

  const tabs = showTabs(state);
  const bleed = state.screen === "start";

  return (
    // The sheet is a modal over the whole webview, so the frame and the overlay
    // share one positioned root.
    <div className="relative">
      <ScreenFrame
        header={<HeaderBar />}
        footer={tabs ? <TabBar /> : mock ? <MockMainButtonBar /> : undefined}
        bleed={bleed}
      >
        {state.screen === "start" ? (
          <StartScreen />
        ) : state.screen === "wizard" ? (
          <WizardScreen />
        ) : state.screen === "results" ? (
          // Keyed on the quote, so a second run starts back on ALL and cheapest
          // rather than inheriting the last run's filter.
          <ResultsScreen key={state.quoteId ?? "pending"} />
        ) : state.screen === "done" ? (
          <DoneScreen />
        ) : state.screen === "home" ? (
          <HomeScreen />
        ) : (
          <ShipsScreen />
        )}
      </ScreenFrame>

      {state.gate && <GateSheet />}
      <ToastHost />
    </div>
  );
}
