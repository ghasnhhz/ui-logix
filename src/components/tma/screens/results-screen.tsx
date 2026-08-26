"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  benchmarkMedian,
  bestValue,
  displayedQuotes,
  isSameQuote,
  modeCounts,
  sortQuotes,
  vsMarketPct,
  type ModeFilter,
  type SortKey,
} from "@/lib/pricing";
import { useTmaApp } from "../app-provider";
import { BenchmarkStrip } from "./results/benchmark-strip";
import { FetchingList } from "./results/fetching-list";
import { ModeChips } from "./results/mode-chips";
import { TmaQuoteCard } from "./results/quote-card";
import { SortToggle } from "./results/sort-toggle";

/**
 * The rows are whatever the server persisted — nothing here prices anything.
 * The collapse, the filter, the sort and the market line are all `lib/pricing`
 * calls, so this screen and the web results page can only ever agree.
 */
export function ResultsScreen() {
  const { state, dispatch } = useTmaApp();
  const t = useTranslations("tma.results");
  const notes = useTranslations("tma.notes");
  // The comp writes no mobile empty state, so the two strings it would need
  // come from the web namespace rather than a fourth translation of them.
  const web = useTranslations("results");
  const [filter, setFilter] = useState<ModeFilter>("ALL");
  const [sort, setSort] = useState<SortKey>("price");

  const view = useMemo(() => {
    const shown = displayedQuotes(state.quotes, filter);
    // An empty filter would put $0 on the market line, so the benchmark falls
    // back to the full set while the empty state explains the gap.
    const forBenchmark = shown.length > 0 ? shown : displayedQuotes(state.quotes, "ALL");

    return {
      rows: sortQuotes(shown, sort),
      best: bestValue(shown),
      counts: modeCounts(state.quotes),
      median: benchmarkMedian(forBenchmark),
      cheapest: bestValue(forBenchmark),
    };
  }, [state.quotes, filter, sort]);

  if (state.fetching) return <FetchingList />;

  return (
    <div className="enter">
      <BenchmarkStrip
        median={view.median}
        saving={Math.max(0, view.median - (view.cheapest?.allIn ?? view.median))}
      />

      <ModeChips active={filter} counts={view.counts} onPick={setFilter} />
      <SortToggle active={sort} onPick={setSort} />

      <p className="mb-[9px] mt-[13px] text-[11.5px] text-ink-500">
        {view.rows.length} {t("quotesFound")}
      </p>

      {/* The list re-orders and re-filters in place, so the change has to be
          announced rather than happening silently. */}
      <div className="flex flex-col gap-2.5" aria-live="polite">
        {view.rows.map((quote) => (
          <TmaQuoteCard
            key={`${quote.carrierId}-${quote.mode}`}
            quote={quote}
            vsPct={vsMarketPct(quote.allIn, view.median)}
            best={view.best !== null && isSameQuote(quote, view.best)}
            onBook={() => {
              dispatch({ type: "selectQuote", quote });
              dispatch({ type: "openGate" });
            }}
          />
        ))}
      </div>

      {view.rows.length === 0 && (
        <div className="rounded-card border border-border bg-surface p-4 text-center">
          <p className="text-pretty text-[13px] font-bold">{web("noQuotesTitle")}</p>
          <button
            type="button"
            onClick={() => setFilter("ALL")}
            className="mt-3 min-h-11 cursor-pointer text-[12px] font-semibold text-blue"
          >
            {web("showAllModes")}
          </button>
        </div>
      )}

      <p className="mt-3 text-pretty text-[10.5px] leading-[1.5] text-ink-500">{notes("seed")}</p>
    </div>
  );
}
