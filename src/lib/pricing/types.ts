export type Mode = "AIR" | "LTL" | "FTL" | "FCL";

export type ModeFilter = Mode | "ALL";

export type PlaceCode =
  | "TAS"
  | "SKD"
  | "ALA"
  | "IST"
  | "PVG"
  | "ICN"
  | "HAM"
  | "BER"
  | "RTM"
  | "FRA"
  | "JFK"
  | "LAX";

export type CargoType =
  | "textiles"
  | "machinery"
  | "electronics"
  | "food"
  | "furniture"
  | "other";

export type WeightUnit = "kg" | "lb";

export type CarrierId = "MSK" | "DBS" | "FDX" | "DHL" | "KNL" | "CMA";

export type Carrier = {
  id: CarrierId;
  name: string;
  rating: number;
  reviews: number;
  onTimePct: number;
  // pf scales price, sf scales transit days. DHL is the expensive fast one,
  // CMA the cheap slow one.
  pf: number;
  sf: number;
  modes: readonly Mode[];
};

export type ShipmentSpec = {
  origin: PlaceCode;
  destination: PlaceCode;
  cargoType: CargoType;
  weight: number;
  unit: WeightUnit;
  pieces: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
};

export type CargoMetrics = {
  pieces: number;
  weightKg: number;
  volumeM3: number;
  density: number;
  volWeightKg: number;
  chargeableKg: number;
  freightClass: number;
  containers: number;
};

export type Quote = {
  carrierId: CarrierId;
  name: string;
  mode: Mode;
  rating: number;
  reviews: number;
  onTimePct: number;
  base: number;
  fuel: number;
  insurance: number;
  thc: number;
  allIn: number;
  transitDays: number;
};

export type Benchmark = {
  median: number;
  vsPct: number;
};
