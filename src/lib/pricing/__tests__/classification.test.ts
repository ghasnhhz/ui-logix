import { describe, expect, it } from "vitest";

import { CARGO_BASE_CLASS, DENSITY_BANDS, densityClass, freightClass } from "../classification";

// [density at the boundary, class at that density, class a hair below it].
// The band walk is inclusive of the threshold, so every row asserts both sides.
const BOUNDARIES: [number, number, number][] = [
  [480, 50, 55],
  [384, 55, 60],
  [288, 60, 65],
  [224, 65, 70],
  [176, 70, 85],
  [128, 85, 92.5],
  [96, 92.5, 100],
  [64, 100, 125],
  [48, 125, 175],
  [32, 175, 250],
  [16, 250, 400],
  [0, 400, 400],
];

describe("densityClass", () => {
  it("covers every band in the table", () => {
    expect(BOUNDARIES).toHaveLength(DENSITY_BANDS.length);
  });

  it.each(BOUNDARIES)("density %d lands on class %d", (density, at) => {
    expect(densityClass(density)).toBe(at);
  });

  it.each(BOUNDARIES)("density just under %d lands on class %d", (density, _at, below) => {
    expect(densityClass(density - 0.001)).toBe(below);
  });

  it("classes very dense cargo at the lowest band", () => {
    expect(densityClass(10_000)).toBe(50);
  });
});

describe("freightClass", () => {
  it("averages the density class with the cargo base", () => {
    // density 64 -> class 100; textiles base 60 -> (100 + 60) / 2
    expect(freightClass(64, "textiles")).toBe(80);
    expect(freightClass(64, "machinery")).toBe(75);
    expect(freightClass(64, "furniture")).toBe(112.5);
  });

  it("keeps one decimal so the 92.5 band survives the average", () => {
    // density 96 -> class 92.5; machinery base 50 -> 71.25 -> 71.3
    expect(freightClass(96, "machinery")).toBe(71.3);
  });

  it("has a base class for every cargo type", () => {
    expect(Object.values(CARGO_BASE_CLASS)).toEqual([60, 50, 85, 70, 125, 100]);
  });
});
