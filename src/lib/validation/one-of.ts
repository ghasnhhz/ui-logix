import { z } from "zod";

// z.enum needs a non-empty tuple to infer the union; the constants are arrays.
export const oneOf = <T extends string>(values: readonly T[]) => z.enum(values as [T, ...T[]]);
