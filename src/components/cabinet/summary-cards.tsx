import { useTranslations } from "next-intl";
import type { CabinetTotals } from "@/lib/cabinet/metrics";
import { money, signedMoney } from "@/lib/ui/money";
import { vsMarketTone } from "@/lib/ui/vs-market";

export function SummaryCards({ totals }: { totals: CabinetTotals }) {
  const t = useTranslations("cabinet");

  const cards = [
    {
      key: "spend",
      value: money(totals.spendYtd),
      valueClass: "",
      label: t("totalSpend"),
      sub: t("totalSpendSub", { n: totals.bookingsYtd }),
    },
    {
      key: "saved",
      value: signedMoney(totals.savedTotal),
      valueClass: vsMarketTone(totals.savedTotal),
      label: t("savedTotal"),
      // No bookings means no average to state — the line goes, it is not zeroed.
      sub: totals.savedPct === null ? null : t("savedTotalSub", { pct: Math.abs(totals.savedPct).toFixed(1) }),
    },
    {
      key: "quotes",
      value: String(totals.quotesThisMonth),
      valueClass: "",
      label: t("quotesRun"),
      sub: t("quotesRunSub"),
    },
  ];

  return (
    <div className="grid gap-[14px] sm:grid-cols-3">
      {cards.map(({ key, value, valueClass, label, sub }) => (
        <article
          key={key}
          className="rounded-card border border-border bg-surface p-[18px] shadow-[0_1px_2px_rgba(15,23,42,.04)]"
        >
          <p className={`font-mono text-[24px] font-semibold tracking-[-0.03em] ${valueClass}`}>
            {value}
          </p>
          <p className="mt-[3px] text-pretty text-[13px] font-semibold leading-tight">{label}</p>
          {sub && <p className="mt-[4px] text-pretty text-[11.5px] text-ink-500">{sub}</p>}
        </article>
      ))}
    </div>
  );
}
