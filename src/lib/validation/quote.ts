import { z } from "zod";
import { PLACE_CODES, type CargoType, type Mode, type PlaceCode } from "@/lib/pricing";
import { CARGO_TYPES, MODES } from "@/lib/wizard/spec";
import { oneOf } from "./one-of";

// Bounds the wizard already enforces, restated because the route handler is the
// trust boundary and the wizard is only a client.
const measurement = z.number().positive().max(100_000);

export const quoteRequestSchema = z.object({
  origin: oneOf<PlaceCode>(PLACE_CODES),
  destination: oneOf<PlaceCode>(PLACE_CODES),
  date: z.iso.date(),
  mode: oneOf<Mode>(MODES),
  cargoType: oneOf<CargoType>(CARGO_TYPES),
  weight: measurement,
  unit: z.enum(["kg", "lb"]),
  pieces: z.number().int().positive().max(10_000),
  lengthCm: measurement,
  widthCm: measurement,
  heightCm: measurement,
  description: z.string().trim().max(500).optional(),
});

export type QuoteRequest = z.infer<typeof quoteRequestSchema>;
