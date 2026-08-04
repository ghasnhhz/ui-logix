import { Factory, Plane, Ship, Truck } from "lucide-react";
import type { Mode } from "@/lib/pricing";

// The comp uses emoji for all four modes; MASTER.md § Icons is the replacement
// mapping. `key` suffixes the wizard message keys (modeAirTitle, modeAirDesc…).
export const MODE_UI = {
  AIR: { Icon: Plane, key: "Air", chip: "bg-mode-air text-mode-air-ink" },
  LTL: { Icon: Truck, key: "Ltl", chip: "bg-mode-ltl text-mode-ltl-ink" },
  FTL: { Icon: Factory, key: "Ftl", chip: "bg-mode-ftl text-mode-ftl-ink" },
  FCL: { Icon: Ship, key: "Fcl", chip: "bg-mode-fcl text-mode-fcl-ink" },
} as const satisfies Record<Mode, { Icon: unknown; key: string; chip: string }>;
