import { z } from "zod";
import { CARRIERS, type CarrierId, type Mode } from "@/lib/pricing";
import { MODES } from "@/lib/wizard/spec";
import { oneOf } from "./one-of";

const CARRIER_IDS = CARRIERS.map((carrier) => carrier.id) as readonly CarrierId[];

// The carrier and mode identify which of the quote's stored rows is being booked.
// They are not trusted as prices — the handler reads the money off that row.
export const bookingRequestSchema = z.object({
  quoteId: z.string().min(1),
  carrierId: oneOf<CarrierId>(CARRIER_IDS),
  mode: oneOf<Mode>(MODES),
  contactName: z.string().trim().min(2).max(120),
  company: z.string().trim().min(2).max(120),
  email: z.email().trim().toLowerCase(),
  phone: z.string().trim().min(6).max(40),
  taxId: z.string().trim().max(64).optional(),
  notes: z.string().trim().max(1000).optional(),
});

export type BookingRequest = z.infer<typeof bookingRequestSchema>;
