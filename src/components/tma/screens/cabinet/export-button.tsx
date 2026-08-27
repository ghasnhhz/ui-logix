"use client";

import { Download } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTmaLocale } from "../../messages-provider";
import { useTmaApp } from "../../app-provider";

/**
 * A plain anchor, exactly as the web cabinet does it: the browser's own
 * `Content-Disposition` handling is what puts the file on disk under its proper
 * name, and the session cookie the Mini App already holds is what authenticates
 * the route. Telegram's own `downloadFile` is deliberately not used — the native
 * downloader carries no webview cookie, so it would 401 against this route.
 *
 * The Mini App has no locale segment (D-044), so the locale the header switcher
 * resolved travels on the query string instead (D-039).
 *
 * The toast is optimistic — a navigation gives the page nothing to observe — and
 * whether a Telegram webview honours the download at all is the open question
 * this screen exists to answer on a real device.
 */
export function ExportButton({ disabled }: { disabled: boolean }) {
  const { dispatch } = useTmaApp();
  const { locale } = useTmaLocale();
  const t = useTranslations("tma.ships");

  const className =
    "mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-[10px] bg-info px-4 text-[13px] font-semibold text-blue transition-colors duration-150";

  if (disabled) {
    return (
      <span aria-disabled="true" className={`${className} opacity-50`}>
        <Download className="size-4" aria-hidden="true" />
        {t("exportCsv")}
      </span>
    );
  }

  return (
    <a
      href={`/api/cabinet/export?locale=${locale}`}
      onClick={() => dispatch({ type: "flash", key: "csv" })}
      className={`${className} cursor-pointer hover:brightness-95`}
    >
      <Download className="size-4" aria-hidden="true" />
      {t("exportCsv")}
    </a>
  );
}
