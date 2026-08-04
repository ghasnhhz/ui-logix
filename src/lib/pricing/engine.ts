import { CARRIERS } from "./carriers";
import { freightClass } from "./classification";
import { laneDistanceKm } from "./distance";
import type { CargoMetrics, Carrier, Mode, Quote, ShipmentSpec } from "./types";

const LB_TO_KG = 0.4536;
// IATA air-freight divisor. Ocean and road reuse it so one chargeable-weight
// helper covers every mode.
const VOLUMETRIC_DIVISOR = 6000;
// Usable cubic metres in a 40ft container.
const CONTAINER_M3 = 58;

export function cargoMetrics(spec: ShipmentSpec): CargoMetrics {
  const pieces = Math.max(1, spec.pieces || 1);
  const kg = spec.unit === "lb" ? (spec.weight || 1) * LB_TO_KG : spec.weight || 1;
  const volumeM3 =
    (pieces * ((spec.lengthCm || 1) * (spec.widthCm || 1) * (spec.heightCm || 1))) / 1e6;
  const weightKg = Math.max(1, kg);
  // Floor the divisor rather than the volume: a zero-dimension shipment must not
  // divide by zero while the wizard is still being filled in.
  const density = weightKg / Math.max(0.001, volumeM3);
  const volWeightKg = (volumeM3 * 1e6) / VOLUMETRIC_DIVISOR;

  return {
    pieces,
    weightKg,
    volumeM3,
    density,
    volWeightKg,
    chargeableKg: Math.max(weightKg, volWeightKg),
    freightClass: freightClass(density, spec.cargoType),
    containers: Math.max(1, Math.ceil(volumeM3 / CONTAINER_M3)),
  };
}

type Leg = { base: number; days: number };

function modeLeg(mode: Mode, m: CargoMetrics, km: number, classMultiplier: number): Leg {
  switch (mode) {
    case "AIR":
      return {
        base: Math.max(340, m.chargeableKg * (1.85 + km / 2600) + m.pieces * 2.2),
        days: 2 + km / 4200,
      };
    case "LTL":
      return {
        base: Math.max(
          280,
          380 +
            m.weightKg * (0.26 + km / 9200) * classMultiplier +
            m.volumeM3 * 46 +
            m.pieces * 2.4,
        ),
        days: 5 + km / 900,
      };
    // A full truckload is priced by distance alone. Weight, volume, piece count
    // and freight class are all ignored on purpose — you are buying the truck.
    case "FTL":
      return { base: 460 + km * 0.58, days: 3 + km / 760 };
    case "FCL":
      return { base: m.containers * (1280 + km * 0.13), days: 13 + km / 440 };
  }
}

function quoteFor(carrier: Carrier, mode: Mode, leg: Leg): Quote {
  const base = leg.base * carrier.pf;
  const fuel = base * (mode === "AIR" ? 0.17 : 0.14);
  const insurance = Math.max(18, base * 0.042);
  const thc = mode === "AIR" ? 145 : mode === "FCL" ? 320 : 120;

  return {
    carrierId: carrier.id,
    name: carrier.name,
    mode,
    rating: carrier.rating,
    reviews: carrier.reviews,
    onTimePct: carrier.onTimePct,
    base,
    fuel,
    insurance,
    thc,
    allIn: base + fuel + insurance + thc,
    transitDays: Math.max(1, Math.round(leg.days * carrier.sf)),
  };
}

export function quoteAll(spec: ShipmentSpec): Quote[] {
  const metrics = cargoMetrics(spec);
  const km = laneDistanceKm(spec.origin, spec.destination);
  const classMultiplier = 1 + (metrics.freightClass - 50) / 240;

  const quotes: Quote[] = [];
  for (const carrier of CARRIERS) {
    for (const mode of carrier.modes) {
      quotes.push(quoteFor(carrier, mode, modeLeg(mode, metrics, km, classMultiplier)));
    }
  }
  return quotes;
}

export function priceShipment(spec: ShipmentSpec) {
  return {
    distanceKm: laneDistanceKm(spec.origin, spec.destination),
    metrics: cargoMetrics(spec),
    quotes: quoteAll(spec),
  };
}
