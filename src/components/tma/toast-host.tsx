"use client";

import { useTranslations } from "next-intl";
import { Toast } from "@/components/ui/toast";
import { showTabs } from "@/lib/tma/main-button";
import { useTmaApp } from "./app-provider";

// Rendered at the positioned root, so a toast raised on one screen survives the
// dispatch that changes screens — re-quote flashes from the cabinet and lands on
// the wizard. The nonce keys it, so a repeat of the same message re-announces.
export function ToastHost() {
  const { state } = useTmaApp();
  const t = useTranslations("tma.toast");

  if (!state.toast) return null;
  // Clear of the tab bar when it is showing — the CSV toast is raised on the
  // cabinet, the re-quote toast lands on the wizard where nothing is below it.
  return (
    <Toast
      key={state.toast.nonce}
      message={t(state.toast.key)}
      bottomClass={showTabs(state) ? "bottom-24" : "bottom-6"}
    />
  );
}
