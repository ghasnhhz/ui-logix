"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { TONE, mainButtonFor, type MainButtonAction } from "@/lib/tma/main-button";
import { useTmaApp } from "./app-provider";
import { useTelegram } from "./telegram-provider";

/**
 * Mirrors the current state onto Telegram's own bottom button (D-047) and
 * returns what it is showing, so the tab bar knows whether it may appear.
 */
export function useMainButton(onAction: (action: MainButtonAction) => void) {
  const { app } = useTelegram();
  const { state } = useTmaApp();
  const t = useTranslations("tma.main");
  const spec = mainButtonFor(state);

  // The click handler is registered once per button configuration; the ref keeps
  // it pointed at the current action without re-binding on every render.
  const handler = useRef<() => void>(() => {});
  handler.current = () => {
    if (spec?.action) onAction(spec.action);
  };

  const label = spec ? t(spec.labelKey) : "";
  const tone = spec?.tone;
  const progress = spec?.progress ?? false;
  const enabled = spec?.action !== null && spec?.action !== undefined;

  useEffect(() => {
    const button = app?.MainButton;
    if (!button) return;

    if (!tone) {
      button.hide();
      return;
    }

    const { color, textColor } = TONE[tone];
    button.setParams({
      text: label,
      color,
      text_color: textColor,
      is_active: enabled,
      is_visible: true,
    });
    // leaveActive=true, or Telegram greys the fill out from under our colour.
    if (progress) button.showProgress(true);
    else button.hideProgress();

    const click = () => handler.current();
    button.onClick(click);
    return () => button.offClick(click);
  }, [app, label, tone, progress, enabled]);

  return spec;
}
