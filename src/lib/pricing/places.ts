import type { PlaceCode } from "./types";

export const PLACES: Record<PlaceCode, string> = {
  TAS: "Tashkent, UZ",
  SKD: "Samarkand, UZ",
  ALA: "Almaty, KZ",
  IST: "Istanbul, TR",
  PVG: "Shanghai, CN",
  ICN: "Seoul, KR",
  HAM: "Hamburg, DE",
  BER: "Berlin, DE",
  RTM: "Rotterdam, NL",
  FRA: "Frankfurt, DE",
  JFK: "New York, US",
  LAX: "Los Angeles, US",
};

// Road distance from Tashkent, in km. This is a per-city scalar, not a matrix —
// see distance.ts for what that costs us.
export const KM: Record<PlaceCode, number> = {
  TAS: 0,
  SKD: 270,
  ALA: 850,
  IST: 3050,
  PVG: 4700,
  ICN: 5100,
  HAM: 5100,
  BER: 4800,
  RTM: 5300,
  FRA: 4900,
  JFK: 10800,
  LAX: 11600,
};

export const PLACE_CODES = Object.keys(PLACES) as PlaceCode[];
