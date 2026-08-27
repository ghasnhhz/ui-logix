"use client";

import { useCallback } from "react";
import type { CabinetRecord } from "@/lib/cabinet/records";
import { STEP_COUNT, specFromParams } from "@/lib/wizard/spec";
import { useTmaApp } from "./app-provider";

/**
 * Re-quote refills the wizard from a history row and lands on review, as the web
 * does (DESIGN.md § Cabinet). The row already carries `requoteHref`, the Feature
 * 3 wizard URL — the Mini App has no address bar, so it takes only the query and
 * runs it back through the same parser rather than growing a second
 * state-transfer path.
 *
 * The comp instead jumps straight to a fresh fetch. Review is the web's
 * behaviour and the safer one: the shipment is three weeks stale by definition,
 * and the ship date in particular is worth seeing before spending a request.
 */
export function useRequote() {
  const { dispatch } = useTmaApp();

  return useCallback(
    (record: CabinetRecord) => {
      const query = record.requoteHref.split("?")[1] ?? "";
      dispatch({ type: "patchSpec", patch: specFromParams(new URLSearchParams(query)) });
      dispatch({ type: "goStep", step: STEP_COUNT });
      dispatch({ type: "flash", key: "requote" });
    },
    [dispatch],
  );
}
