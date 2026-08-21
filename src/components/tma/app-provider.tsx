"use client";

import { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import { initialState, reduce, type TmaAction, type TmaState } from "@/lib/tma/state";

type AppValue = { state: TmaState; dispatch: React.Dispatch<TmaAction> };

const AppContext = createContext<AppValue | null>(null);

export function useTmaApp() {
  const value = useContext(AppContext);
  if (!value) throw new Error("useTmaApp must be used inside <TmaAppProvider>");
  return value;
}

// Feature 8 replaces this with POST /api/auth/telegram. Until then the shell
// asks the session route the web app already owns: a Telegram user has no
// session yet and stays a guest, which is the correct state for Feature 7.
async function hasSession() {
  try {
    const response = await fetch("/api/auth/me");
    return response.ok;
  } catch {
    return false;
  }
}

const mockAuthed = () =>
  process.env.NODE_ENV !== "production" &&
  new URLSearchParams(window.location.search).get("tma-mock") === "authed";

export function TmaAppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reduce, true, (guest) => initialState(guest));

  useEffect(() => {
    if (mockAuthed()) {
      dispatch({ type: "signedIn" });
      return;
    }
    let cancelled = false;
    hasSession().then((signedIn) => {
      if (signedIn && !cancelled) dispatch({ type: "signedIn" });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(() => ({ state, dispatch }), [state]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
