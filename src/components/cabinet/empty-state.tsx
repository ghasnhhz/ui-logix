"use client";

import { Package } from "lucide-react";
import { Link } from "@/i18n/navigation";

// Shared by the dashboard and the cabinet, and by the cabinet's per-tab empties,
// so the copy arrives as props rather than being read from one namespace.
export function EmptyState({
  title,
  body,
  cta,
}: {
  title: string;
  body?: string;
  cta?: string;
}) {
  return (
    <div className="rounded-card border border-dashed border-border-strong bg-surface p-[34px] text-center">
      <Package className="mx-auto size-6 text-ink-500" aria-hidden="true" />
      <p className="mt-3 text-[15px] font-bold">{title}</p>
      {body && (
        <p className="mx-auto mt-[7px] max-w-[420px] text-pretty text-[13px] leading-relaxed text-ink-500">
          {body}
        </p>
      )}
      {cta && (
        <Link
          href="/quote"
          className="mt-4 inline-flex min-h-[44px] cursor-pointer items-center rounded-control bg-blue px-[18px] text-[13px] font-semibold text-white transition-colors duration-150 hover:bg-blue-hover"
        >
          {cta}
        </Link>
      )}
    </div>
  );
}
