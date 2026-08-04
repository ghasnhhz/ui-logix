"use client";

import { useMemo, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  benchmarkMedian,
  bestValue,
  displayedQuotes,
  isSameQuote,
  modeCounts,
  sortQuotes,
  vsMarketPct,
  type ModeFilter as Filter,
  type Quote,
  type SortKey,
} from "@/lib/pricing";
import { BenchmarkBar } from "./benchmark-bar";
import { EmptyState } from "./empty-state";
import { ModeFilter } from "./mode-filter";
import { QuoteCard } from "./quote-card";
import { SortControl } from "./sort-control";

export type ResultsData = {
  id: string;
  lane: string;
  shipDate: string;
  backHref: string;
  quotes: Quote[];
};

export function ResultsView({ data }: { data: ResultsData }) {
  const t = useTranslations("results");
  const [filter, setFilter] = useState<Filter>("ALL");
  const [sort, setSort] = useState<SortKey>("price");

  // Every one of these comes from lib/pricing — the collapse, the filter, the
  // sort and the benchmark are all engine concerns, not view concerns.
  const view = useMemo(() => {
    const shown = displayedQuotes(data.quotes, filter);
    const best = bestValue(shown);
    // An empty filter would give a $0 market line, so the bar falls back to the
    // full set while the empty state explains the gap.
    const forBenchmark = shown.length > 0 ? shown : displayedQuotes(data.quotes, "ALL");

    return {
      rows: sortQuotes(shown, sort),
      best,
      counts: modeCounts(data.quotes),
      median: benchmarkMedian(forBenchmark),
      cheapest: bestValue(forBenchmark),
    };
  }, [data.quotes, filter, sort]);

  return (
    <div className="mx-auto w-full max-w-[1320px]">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div className="min-w-0">
          <Link
            href={data.backHref}
            className="flex cursor-pointer items-center gap-[6px] text-[12.5px] font-semibold text-ink-500 transition-colors duration-150 hover:text-blue"
          >
            <ChevronLeft className="size-[14px]" aria-hidden="true" />
            {t("backToQuote")}
          </Link>
          <h1 className="mt-[10px] text-pretty text-[24px] font-bold tracking-[-0.03em]">
            {t("quotesFound", { n: view.rows.length })}
          </h1>
          <p className="mt-[5px] text-[13px] text-ink-500">
            <span className="font-semibold text-ink-600">{data.lane}</span> · {data.shipDate}
          </p>
        </div>

        <BenchmarkBar
          median={view.median}
          saving={Math.max(0, view.median - (view.cheapest?.allIn ?? view.median))}
        />
      </div>

      <div className="mt-[18px] grid gap-[18px] lg:grid-cols-[200px_1fr]">
        <div className="flex flex-col gap-[14px]">
          <ModeFilter active={filter} counts={view.counts} onPick={setFilter} />
          <SortControl active={sort} onPick={setSort} />
        </div>

        {/* The list re-orders and re-filters without a navigation, so the
            change has to be announced rather than happening silently. */}
        <div className="flex min-w-0 flex-col gap-[14px]" aria-live="polite">
          {view.rows.map((quote) => (
            <QuoteCard
              key={`${quote.carrierId}-${quote.mode}`}
              quote={quote}
              quoteId={data.id}
              vsPct={vsMarketPct(quote.allIn, view.median)}
              best={view.best !== null && isSameQuote(quote, view.best)}
            />
          ))}

          {view.rows.length === 0 && <EmptyState onReset={() => setFilter("ALL")} />}

          <p className="text-pretty px-1 text-[12px] leading-relaxed text-ink-500">
            {t("seedNote")}
          </p>
        </div>
      </div>
    </div>
  );
}
