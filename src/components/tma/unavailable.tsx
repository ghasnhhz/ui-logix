"use client";

import { Send } from "lucide-react";
import { useTranslations } from "next-intl";

// Production only: the SDK never appeared, so the page is open in an ordinary
// browser. Say so rather than rendering an app whose chrome will never show.
export function Unavailable() {
  const t = useTranslations("tma.unavailable");

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-3 bg-navy px-8 text-center">
      <div className="flex size-11 items-center justify-center rounded-control bg-amber text-amber-ink">
        <Send className="size-5" aria-hidden />
      </div>
      <h1 className="text-lg font-bold tracking-tight text-white">{t("title")}</h1>
      <p className="text-sm leading-relaxed text-navy-muted">{t("body")}</p>
    </div>
  );
}
