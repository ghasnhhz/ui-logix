"use client";

import { useTranslations } from "next-intl";
import type { ApiError } from "@/lib/ui/api-client";

// The load does not retry on its own — an effect that re-fired on failure would
// loop — so the retry is the user's, here.
export function LoadFailed({ error, onRetry }: { error: ApiError; onRetry: () => void }) {
  const common = useTranslations("common");

  return (
    <div role="alert" className="rounded-card border border-border bg-surface p-5 text-center">
      <p className="text-pretty text-[12.5px] text-ink-600">{error.message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-2 min-h-11 cursor-pointer text-[12px] font-semibold text-blue transition-colors duration-150 hover:text-blue-hover"
      >
        {common("retry")}
      </button>
    </div>
  );
}
