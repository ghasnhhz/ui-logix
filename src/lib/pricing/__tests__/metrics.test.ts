import { describe, expect, it } from "vitest";

import { cargoMetrics } from "../engine";
import { COMP_DEFAULT } from "./fixtures";

describe("cargoMetrics", () => {
  it("reproduces the comp's default shipment", () => {
    const m = cargoMetrics(COMP_DEFAULT);

    expect(m.pieces).toBe(12);
    expect(m.weightKg).toBe(850);
    expect(m.volumeM3).toBeCloseTo(10.944, 9);
    expect(m.density).toBeCloseTo(77.66812865497076, 9);
    expect(m.volWeightKg).toBeCloseTo(1824, 9);
    expect(m.chargeableKg).toBeCloseTo(1824, 9);
    expect(m.freightClass).toBe(80);
    expect(m.containers).toBe(1);
  });

  it("charges on volumetric weight when the cargo is light and bulky", () => {
    const m = cargoMetrics({ ...COMP_DEFAULT, weight: 100 });
    expect(m.chargeableKg).toBe(m.volWeightKg);
    expect(m.chargeableKg).toBeGreaterThan(m.weightKg);
  });

  it("charges on gross weight when the cargo is dense", () => {
    const m = cargoMetrics({ ...COMP_DEFAULT, weight: 9000 });
    expect(m.chargeableKg).toBe(9000);
  });

  it("converts pounds at 0.4536", () => {
    const m = cargoMetrics({ ...COMP_DEFAULT, unit: "lb" });
    expect(m.weightKg).toBeCloseTo(850 * 0.4536, 9);
  });

  it("floors pieces and weight at one", () => {
    const m = cargoMetrics({ ...COMP_DEFAULT, pieces: 0, weight: 0 });
    expect(m.pieces).toBe(1);
    expect(m.weightKg).toBe(1);
  });

  it("does not divide by zero when the dimensions are still blank", () => {
    const m = cargoMetrics({
      ...COMP_DEFAULT,
      lengthCm: 0,
      widthCm: 0,
      heightCm: 0,
    });
    // 0 dimensions fall back to 1cm each, so the volume is tiny but non-zero and
    // the 0.001 divisor floor never actually engages here.
    expect(Number.isFinite(m.density)).toBe(true);
    expect(m.density).toBeGreaterThan(0);
  });

  it("counts a second container past 58 cubic metres", () => {
    expect(cargoMetrics({ ...COMP_DEFAULT, pieces: 63 }).containers).toBe(1);
    expect(cargoMetrics({ ...COMP_DEFAULT, pieces: 64 }).containers).toBe(2);
  });
});
