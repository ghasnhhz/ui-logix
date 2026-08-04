import { Armchair, Cog, Laptop, Package, Shirt, Wheat } from "lucide-react";
import type { CargoType } from "@/lib/pricing";

// `key` suffixes the wizard message keys (cargoTextilesLabel, cargoTextilesHint).
// Approximate classes come from CARGO_BASE_CLASS, not from a second table here.
export const CARGO_UI = {
  textiles: { Icon: Shirt, key: "Textiles" },
  machinery: { Icon: Cog, key: "Machinery" },
  electronics: { Icon: Laptop, key: "Electronics" },
  food: { Icon: Wheat, key: "Food" },
  furniture: { Icon: Armchair, key: "Furniture" },
  other: { Icon: Package, key: "Other" },
} as const satisfies Record<CargoType, { Icon: unknown; key: string }>;
