import { PLACES, PLACE_CODES, type PlaceCode } from "@/lib/pricing";

// City names are the same in every locale in both comps, so they stay in the
// pricing module rather than being triplicated into the message files.
export const PLACE_OPTIONS = PLACE_CODES.map((value) => ({
  value,
  label: PLACES[value],
}));

export const cityName = (code: PlaceCode) => PLACES[code].split(",")[0];

// Distances are grouped in en-US everywhere so the figure renders identically on
// the server and the client, and reads the same as the comp.
export const formatKm = (km: number) => `${km.toLocaleString("en-US")} km`;
