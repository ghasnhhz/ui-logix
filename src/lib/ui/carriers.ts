import type { CarrierId } from "@/lib/pricing";

// Brand colours are presentation, so they live here rather than in the pure
// engine (D-021). Values from design-system/MASTER.md § Carrier brand marks.
// MASTER says the mark's text is always white, but white on DHL's amber is
// 2.1:1 and the initials are text — so that one mark takes amber-ink instead.
export const CARRIER_MARK: Record<CarrierId, string> = {
  MSK: "bg-carrier-msk text-white",
  DBS: "bg-carrier-dbs text-white",
  FDX: "bg-carrier-fdx text-white",
  DHL: "bg-carrier-dhl text-amber-ink",
  KNL: "bg-carrier-knl text-white",
  CMA: "bg-carrier-cma text-white",
};
