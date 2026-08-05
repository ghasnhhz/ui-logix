import type { ComponentType } from "react";

// Lucide icons accept the full SVG prop set; this is the slice the card uses.
type IconComponent = ComponentType<{ className?: string; "aria-hidden"?: boolean }>;

export type KpiPill = {
  text: string;
  tone: "success" | "warning" | "neutral";
  Icon?: IconComponent;
};

const PILL_TONE = {
  success: "bg-success text-success-ink",
  // warning-ink is only legible on the warning fill, never on white (D-031).
  warning: "bg-warning text-warning-ink",
  neutral: "bg-page-alt text-ink-600",
} as const;

export function KpiCard({
  Icon,
  tile,
  value,
  valueClass = "",
  label,
  sub,
  pill,
}: {
  Icon: IconComponent;
  tile: string;
  value: string;
  valueClass?: string;
  label: string;
  sub: string;
  pill?: KpiPill;
}) {
  return (
    <article className="rounded-card border border-border bg-surface p-[18px] shadow-[0_1px_2px_rgba(15,23,42,.04)]">
      <div className="flex items-start justify-between gap-3">
        <span
          className={`flex size-[36px] flex-none items-center justify-center rounded-control ${tile}`}
        >
          <Icon className="size-[18px]" aria-hidden />
        </span>
        {pill && (
          <span
            className={`inline-flex items-center gap-1 text-pretty rounded-full px-[9px] py-[4px] text-[11px] font-semibold ${PILL_TONE[pill.tone]}`}
          >
            {pill.Icon && <pill.Icon className="size-[12px]" aria-hidden />}
            {pill.text}
          </span>
        )}
      </div>

      <p className={`mt-[14px] font-mono text-[26px] font-semibold tracking-[-0.03em] ${valueClass}`}>
        {value}
      </p>
      {/* Labels wrap rather than truncate — "Расходы с начала года" and
          "Yil boshidan xarajat" both outrun the English at this card width. */}
      <p className="mt-[3px] text-pretty text-[13px] font-semibold leading-tight">{label}</p>
      <p className="mt-[5px] text-pretty text-[11.5px] leading-snug text-ink-500">{sub}</p>
    </article>
  );
}
