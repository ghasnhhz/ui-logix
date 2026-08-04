import type { CargoType } from "./types";

// [minimum density in kg/m3, freight class]. Walked top down; the first band the
// density reaches wins, so the comparison is inclusive of the threshold. Denser
// cargo classes lower, which is cheaper — class is an inverse density scale.
export const DENSITY_BANDS: readonly (readonly [number, number])[] = [
  [480, 50],
  [384, 55],
  [288, 60],
  [224, 65],
  [176, 70],
  [128, 85],
  [96, 92.5],
  [64, 100],
  [48, 125],
  [32, 175],
  [16, 250],
  [0, 400],
];

export const CARGO_BASE_CLASS: Record<CargoType, number> = {
  textiles: 60,
  machinery: 50,
  electronics: 85,
  food: 70,
  furniture: 125,
  other: 100,
};

export function densityClass(density: number) {
  for (const [threshold, cls] of DENSITY_BANDS) {
    if (density >= threshold) return cls;
  }
  return 400;
}

// The measured density and the declared cargo type get equal weight: a shipper
// who picks "furniture" but measures dense still lands mid-scale. One decimal
// because 92.5 is a real band value.
export function freightClass(density: number, cargoType: CargoType) {
  const base = CARGO_BASE_CLASS[cargoType] ?? CARGO_BASE_CLASS.other;
  return Math.round(((densityClass(density) + base) / 2) * 10) / 10;
}
