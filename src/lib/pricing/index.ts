export type {
  Benchmark,
  CargoMetrics,
  CargoType,
  Carrier,
  CarrierId,
  Mode,
  ModeFilter,
  PlaceCode,
  Quote,
  ShipmentSpec,
  WeightUnit,
} from "./types";

export { CARRIERS } from "./carriers";
export { KM, PLACES, PLACE_CODES } from "./places";
export { laneDistanceKm } from "./distance";
export { CARGO_BASE_CLASS, DENSITY_BANDS, densityClass, freightClass } from "./classification";
export { cargoMetrics, priceShipment, quoteAll } from "./engine";
export { benchmark, benchmarkMedian, vsMarketPct } from "./benchmark";
export {
  bestValue,
  displayedQuotes,
  isSameQuote,
  modeCounts,
  SORT_KEYS,
  sortQuotes,
  type SortKey,
} from "./selection";
