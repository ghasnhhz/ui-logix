import { useTranslations } from "next-intl";
import type { PlaceCode } from "@/lib/pricing";
import { cityName } from "@/lib/ui/places";

// The comp computes these four lanes but never renders them (quickLanes,
// U_Logix_Web_dc.html line 1193). DESIGN.md requires the chips, so the shape
// comes from that data and the colours from its active/idle branches.
const LANES: readonly (readonly [PlaceCode, PlaceCode])[] = [
  ["TAS", "PVG"],
  ["TAS", "RTM"],
  ["TAS", "IST"],
  ["ALA", "BER"],
];

type Props = {
  origin: PlaceCode;
  destination: PlaceCode;
  onPick: (origin: PlaceCode, destination: PlaceCode) => void;
};

export function LaneChips({ origin, destination, onPick }: Props) {
  const t = useTranslations("landing");

  return (
    <div className="mt-4">
      <p className="micro-label mb-2 text-[9.5px] text-ink-500">{t("popularLanes")}</p>
      <div className="flex flex-wrap gap-2">
        {LANES.map(([from, to]) => {
          const on = origin === from && destination === to;
          return (
            <button
              key={`${from}-${to}`}
              type="button"
              aria-pressed={on}
              onClick={() => onPick(from, to)}
              className={`cursor-pointer rounded-chip px-[10px] py-[6px] text-[11.5px] font-semibold transition-colors duration-150 ${
                on
                  ? "border-[1.5px] border-blue bg-info text-blue-hover"
                  : "border border-border bg-surface text-ink-600 hover:border-blue hover:text-blue"
              }`}
            >
              {cityName(from)} → {cityName(to)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
