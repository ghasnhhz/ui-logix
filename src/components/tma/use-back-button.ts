"use client";

import { useEffect, useRef } from "react";
import { showBackButton } from "@/lib/tma/state";
import { useTmaApp } from "./app-provider";
import { useTelegram } from "./telegram-provider";

/**
 * Telegram owns the back affordance. Order is the comp's: close the sheet, else
 * step back through the wizard, else leave for the screen that led here.
 */
export function useBackButton() {
  const { app } = useTelegram();
  const { state, dispatch } = useTmaApp();
  const visible = showBackButton(state);

  const handler = useRef<() => void>(() => {});
  handler.current = () => dispatch({ type: "back" });

  useEffect(() => {
    const button = app?.BackButton;
    if (!button) return;

    if (visible) button.show();
    else button.hide();

    const click = () => handler.current();
    button.onClick(click);
    return () => button.offClick(click);
  }, [app, visible]);

  return visible;
}
