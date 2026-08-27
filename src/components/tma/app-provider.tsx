"use client";

import { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import {
  initialState,
  reduce,
  type TmaAccount,
  type TmaAction,
  type TmaState,
} from "@/lib/tma/state";
import { useTelegram } from "./telegram-provider";

type AppValue = { state: TmaState; dispatch: React.Dispatch<TmaAction> };

const AppContext = createContext<AppValue | null>(null);

export function useTmaApp() {
  const value = useContext(AppContext);
  if (!value) throw new Error("useTmaApp must be used inside <TmaAppProvider>");
  return value;
}

type AccountRow = { email: string; company: string; phone: string | null };

// Narrowed on the way in: the handlers select an id too, and the booking sheet
// has no business holding one.
const toAccount = (row: AccountRow): TmaAccount => ({
  email: row.email,
  company: row.company,
  phone: row.phone,
});

// The cookie is issued from a server-side HMAC check of initData, never from
// anything the client asserts. A failure of any kind — bad signature, no
// account yet, no network — leaves the user a guest, which is a real state
// here and not an error to show. The account comes back with it because the
// booking sheet fills itself from the row rather than from initDataUnsafe.
async function signIn(initData: string): Promise<TmaAccount | null> {
  try {
    const response = await fetch("/api/auth/telegram", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ initData }),
    });
    if (!response.ok) return null;
    const body = await response.json();
    if (body?.data?.authenticated !== true) return null;
    return toAccount(body.data.user as AccountRow);
  } catch {
    return null;
  }
}

// Development only. The mock leaves initData empty and cannot authenticate
// (D-050), so `?tma-mock=authed` flips the flag — but a browser run against a
// real session still needs the account behind that cookie, or the booking sheet
// would come up blank where a real client's comes up filled.
async function mockAccount(): Promise<TmaAccount | null> {
  try {
    const response = await fetch("/api/auth/me");
    if (!response.ok) return null;
    return toAccount((await response.json()).data as AccountRow);
  } catch {
    return null;
  }
}

const mockAuthed = () =>
  process.env.NODE_ENV !== "production" &&
  new URLSearchParams(window.location.search).get("tma-mock") === "authed";

export function TmaAppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reduce, true, (guest) => initialState(guest));
  const { app, status } = useTelegram();

  useEffect(() => {
    let cancelled = false;

    if (mockAuthed()) {
      mockAccount().then((account) => {
        if (!cancelled) dispatch({ type: "signedIn", account: account ?? undefined });
      });
      return () => {
        cancelled = true;
      };
    }

    // The dev mock and any plain browser carry no initData (D-050), so there is
    // nothing to verify and the request would be a guaranteed 401.
    if (status !== "ready" || !app?.initData) return;

    signIn(app.initData).then((account) => {
      if (account && !cancelled) dispatch({ type: "signedIn", account });
    });
    return () => {
      cancelled = true;
    };
  }, [app, status]);

  const value = useMemo(() => ({ state, dispatch }), [state]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
