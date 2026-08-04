import { KM } from "./places";
import type { PlaceCode } from "./types";

// A lane is the absolute difference of two distances-from-Tashkent. That is only
// correct for lanes that actually pass through Tashkent: TAS->ALA gives 850km
// (right), ALA->BER gives 3950km (plausible by accident), and anything routed
// around Tashkent is wrong. It is kept because every price in the demo is
// calibrated against it — replacing it with a real distance matrix moves every
// number on screen, so that is a Phase 2 job (D-009), not a silent patch.
//
// The zero fallbacks matter: a same-city lane differences to 0 and falls through
// to the destination's own distance, and TAS->TAS falls further to 600.
export function laneDistanceKm(origin: PlaceCode, destination: PlaceCode) {
  const from = KM[origin] ?? 0;
  const to = KM[destination] ?? 0;
  return Math.max(180, Math.abs(to - from) || to || 600);
}
