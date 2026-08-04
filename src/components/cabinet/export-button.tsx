"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Toast } from "@/components/ui/toast";

// A plain anchor, not a fetch: the browser's own download handling is what puts
// the file on disk with its Content-Disposition name. The locale rides along so
// the handler can localise the nine column headers, which have no locale of
// their own on an /api route.
export function ExportButton({ disabled }: { disabled: boolean }) {
  const t = useTranslations("cabinet");
  const tt = useTranslations("toast");
  const locale = useLocale();
  const [downloads, setDownloads] = useState(0);

  const className =
    "flex min-h-[40px] flex-none items-center gap-[7px] rounded-control px-[15px] text-[12.5px] font-semibold transition-colors duration-150";

  if (disabled) {
    return (
      <span className={`${className} cursor-not-allowed bg-page-alt text-ink-400`} aria-disabled>
        <Download className="size-4" aria-hidden="true" />
        {t("exportCsv")}
      </span>
    );
  }

  return (
    <>
      <a
        href={`/api/cabinet/export?locale=${locale}`}
        onClick={() => setDownloads((count) => count + 1)}
        className={`${className} cursor-pointer bg-navy text-white hover:brightness-110`}
      >
        <Download className="size-4" aria-hidden="true" />
        {t("exportCsv")}
      </a>
      {/* Keyed so a second download re-mounts the toast rather than reusing an
          already-dismissed one. */}
      {downloads > 0 && <Toast key={downloads} message={tt("csv")} />}
    </>
  );
}
