"use client";

import { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import { initialState, reduce, type TmaAction, type TmaState } from "@/lib/tma/state";
import { useTelegram } from "./telegram-provider";

type AppValue = { state: TmaState; dispatch: React.Dispatch<TmaAction> };

const AppContext = createContext<AppValue | null>(null);

export function useTmaApp() {
  const value = useContext(AppContext);
  if (!value) throw new Error("useTmaApp must be used inside <TmaAppProvider>");
  return value;
}

// The cookie is issued from a server-side HMAC check of initData, never from
// anything the client asserts. A failure of any kind — bad signature, no
// account yet, no network — leaves the user a guest, which is a real state
// here and not an error to show.
async function signIn(initData: string) {
  try {
    const response = await fetch("/api/auth/telegram", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ initData }),
    });
    if (!response.ok) return false;
    const body = await response.json();
    return body?.data?.authenticated === true;
  } catch {
    return false;
  }
}

const mockAuthed = () =>
  process.env.NODE_ENV !== "production" &&
  new URLSearchParams(window.location.search).get("tma-mock") === "authed";

export function TmaAppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reduce, true, (guest) => initialState(guest));
  const { app, status } = useTelegram();

  useEffect(() => {
    if (mockAuthed()) {
      dispatch({ type: "signedIn" });
      return;
    }
    // The dev mock and any plain browser carry no initData (D-050), so there is
    // nothing to verify and the request would be a guaranteed 401.
    if (status !== "ready" || !app?.initData) return;

    let cancelled = false;
    signIn(app.initData).then((signedIn) => {
      if (signedIn && !cancelled) dispatch({ type: "signedIn" });
    });
    return () => {
      cancelled = true;
    };
  }, [app, status]);

  const value = useMemo(() => ({ state, dispatch }), [state]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
