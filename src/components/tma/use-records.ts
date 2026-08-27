"use client";

import { useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";
import type { CabinetRecord } from "@/lib/cabinet/records";
import { get, isError } from "@/lib/ui/api-client";
import { useTmaApp } from "./app-provider";

type CabinetPayload = { records: CabinetRecord[]; now: string };

/**
 * Loads the cabinet's rows for the two screens that read them. One fetch per
 * session, not per screen: `home` and `ships` render the same union, and a
 * booking is the only thing that invalidates it (the `booked` action clears it,
 * so back from the done screen re-reads).
 *
 * A failure does not retry on its own — the effect would loop — so the screens
 * offer the retry instead.
 */
export function useRecords() {
  const { state, dispatch } = useTmaApp();
  const tc = useTranslations("common");

  const load = useCallback(async () => {
    dispatch({ type: "recordsStart" });
    const result = await get<CabinetPayload>("/api/cabinet", tc("genericError"));
    if (isError(result)) {
      dispatch({ type: "recordsFailed", error: result.error });
      return;
    }
    dispatch({ type: "recordsDone", records: result.data.records, now: result.data.now });
  }, [dispatch, tc]);

  const idle = state.records === null && state.recordsError === null && !state.recordsLoading;

  useEffect(() => {
    // A guest has no session and would get a 401 for its trouble.
    if (state.guest || idle === false) return;
    void load();
  }, [state.guest, idle, load]);

  return { reload: load };
}
