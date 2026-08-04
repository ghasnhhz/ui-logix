import type { Carrier } from "./types";

// Not a database table: nothing writes these in Phase 1, and a file is faster to
// seed and easier to diff than a migration (D-003). Carrier brand colours are
// deliberately absent — they are presentation and belong to
// design-system/MASTER.md § Carrier brand marks, not to the pure engine.
export const CARRIERS = [
  {
    id: "MSK",
    name: "Maersk Line",
    rating: 4.5,
    reviews: 3200,
    onTimePct: 88,
    pf: 0.86,
    sf: 1.0,
    modes: ["FCL", "LTL", "FTL"],
  },
  {
    id: "DBS",
    name: "DB Schenker",
    rating: 4.4,
    reviews: 980,
    onTimePct: 89,
    pf: 0.97,
    sf: 0.9,
    modes: ["FTL", "LTL", "AIR", "FCL"],
  },
  {
    id: "FDX",
    name: "FedEx Freight",
    rating: 4.6,
    reviews: 1820,
    onTimePct: 91,
    pf: 1.03,
    sf: 0.84,
    modes: ["LTL", "AIR", "FTL"],
  },
  {
    id: "DHL",
    name: "DHL Express",
    rating: 4.7,
    reviews: 4100,
    onTimePct: 95,
    pf: 1.18,
    sf: 0.72,
    modes: ["AIR", "LTL"],
  },
  {
    id: "KNL",
    name: "Kuehne + Nagel",
    rating: 4.3,
    reviews: 1240,
    onTimePct: 87,
    pf: 0.92,
    sf: 1.08,
    modes: ["FCL", "FTL", "AIR", "LTL"],
  },
  {
    id: "CMA",
    name: "CMA CGM",
    rating: 4.1,
    reviews: 760,
    onTimePct: 84,
    pf: 0.81,
    sf: 1.28,
    modes: ["FCL", "FTL"],
  },
] as const satisfies readonly Carrier[];
