import { describe, expect, it } from "vitest";

import { laneDistanceKm } from "../distance";

describe("laneDistanceKm", () => {
  it("is right for the lanes that pass through Tashkent", () => {
    expect(laneDistanceKm("TAS", "ALA")).toBe(850);
    expect(laneDistanceKm("TAS", "SKD")).toBe(270);
    expect(laneDistanceKm("ALA", "BER")).toBe(3950);
  });

  it("is symmetric", () => {
    expect(laneDistanceKm("ALA", "BER")).toBe(laneDistanceKm("BER", "ALA"));
  });

  it("floors at 180km", () => {
    // Berlin and Frankfurt sit 100km apart on the from-Tashkent scale.
    expect(laneDistanceKm("BER", "FRA")).toBe(180);
  });

  it("falls back to the destination's own distance for a same-city lane", () => {
    expect(laneDistanceKm("ALA", "ALA")).toBe(850);
  });

  it("falls back to 600km when both ends are Tashkent", () => {
    expect(laneDistanceKm("TAS", "TAS")).toBe(600);
  });

  // Documented consequence of the hack, not a defect (D-009). Seoul and Hamburg
  // are both 5100km from Tashkent, so the engine prices the lane between them as
  // if they were the same place. Locked in a test so nobody "fixes" it by accident.
  it("collapses two cities that are equidistant from Tashkent", () => {
    expect(laneDistanceKm("ICN", "HAM")).toBe(5100);
  });
});
