"use client";

import { useTranslations } from "next-intl";
import { Toast } from "@/components/ui/toast";
import { useTmaApp } from "./app-provider";

// Rendered at the positioned root, so a toast raised on one screen survives the
// dispatch that changes screens — re-quote flashes from the cabinet and lands on
// the wizard. The nonce keys it, so a repeat of the same message re-announces.
export function ToastHost() {
  const { state } = useTmaApp();
  const t = useTranslations("tma.toast");

  if (!state.toast) return null;
  return <Toast key={state.toast.nonce} message={t(state.toast.key)} />;
}
