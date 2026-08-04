import {
  CARGO_BASE_CLASS,
  PLACE_CODES,
  type CargoType,
  type Mode,
  type PlaceCode,
  type ShipmentSpec,
  type WeightUnit,
} from "@/lib/pricing";

export type WizardSpec = ShipmentSpec & {
  mode: Mode;
  date: string;
  description: string;
};

export const STEP_COUNT = 5;

export const MODES: readonly Mode[] = ["AIR", "LTL", "FTL", "FCL"];
export const CARGO_TYPES = Object.keys(CARGO_BASE_CLASS) as CargoType[];

// The comp's own starting shipment (U_Logix_Web_dc.html line 997). The pricing
// goldens are calibrated against it, and a fixed date keeps the server and the
// client rendering the same string. Revisit the date before the demo.
export const DEFAULT_SPEC: WizardSpec = {
  origin: "TAS",
  destination: "ALA",
  date: "2026-08-27",
  mode: "LTL",
  cargoType: "textiles",
  weight: 850,
  unit: "kg",
  pieces: 12,
  lengthCm: 120,
  widthCm: 80,
  heightCm: 95,
  description: "",
};

// Short keys so a shared wizard link stays readable.
const KEYS = {
  origin: "origin",
  destination: "dest",
  date: "date",
  mode: "mode",
  cargoType: "cargo",
  weight: "weight",
  unit: "unit",
  pieces: "pieces",
  lengthCm: "len",
  widthCm: "wid",
  heightCm: "hei",
  description: "desc",
} as const satisfies Record<keyof WizardSpec, string>;

export type ParamInput =
  | URLSearchParams
  | Readonly<Record<string, string | string[] | undefined>>;

function reader(input: ParamInput) {
  if (input instanceof URLSearchParams) {
    return (key: string) => input.get(key) ?? undefined;
  }
  return (key: string) => {
    const value = input[key];
    return Array.isArray(value) ? value[0] : value;
  };
}

const oneOf = <T extends string>(allowed: readonly T[], raw: string | undefined, fallback: T) =>
  allowed.includes(raw as T) ? (raw as T) : fallback;

// Zero rather than the default, so clearing a field in the wizard leaves it
// empty instead of snapping back to a number the user did not type.
const num = (raw: string | undefined, fallback: number) => {
  if (raw === undefined) return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
};

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function specFromParams(input: ParamInput): WizardSpec {
  const get = reader(input);
  const date = get(KEYS.date);

  return {
    origin: oneOf<PlaceCode>(PLACE_CODES, get(KEYS.origin), DEFAULT_SPEC.origin),
    destination: oneOf<PlaceCode>(PLACE_CODES, get(KEYS.destination), DEFAULT_SPEC.destination),
    date: date && ISO_DATE.test(date) ? date : DEFAULT_SPEC.date,
    mode: oneOf<Mode>(MODES, get(KEYS.mode), DEFAULT_SPEC.mode),
    cargoType: oneOf<CargoType>(CARGO_TYPES, get(KEYS.cargoType), DEFAULT_SPEC.cargoType),
    weight: num(get(KEYS.weight), DEFAULT_SPEC.weight),
    unit: oneOf<WeightUnit>(["kg", "lb"], get(KEYS.unit), DEFAULT_SPEC.unit),
    pieces: num(get(KEYS.pieces), DEFAULT_SPEC.pieces),
    lengthCm: num(get(KEYS.lengthCm), DEFAULT_SPEC.lengthCm),
    widthCm: num(get(KEYS.widthCm), DEFAULT_SPEC.widthCm),
    heightCm: num(get(KEYS.heightCm), DEFAULT_SPEC.heightCm),
    description: get(KEYS.description) ?? DEFAULT_SPEC.description,
  };
}

export function specToParams(spec: WizardSpec, extra: Record<string, string> = {}) {
  const params = new URLSearchParams();
  for (const [field, key] of Object.entries(KEYS)) {
    const value = spec[field as keyof WizardSpec];
    if (value !== "") params.set(key, String(value));
  }
  for (const [key, value] of Object.entries(extra)) params.set(key, value);
  return params;
}

export function clampStep(raw: string | undefined) {
  const parsed = Number(raw);
  if (!Number.isInteger(parsed)) return 1;
  return Math.min(STEP_COUNT, Math.max(1, parsed));
}
