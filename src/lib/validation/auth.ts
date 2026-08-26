import { z } from "zod";

export const signupSchema = z.object({
  email: z.email().trim().toLowerCase(),
  password: z.string().min(8),
  company: z.string().trim().min(2),
  phone: z.string().trim().min(6).optional(),
});

export const loginSchema = z.object({
  email: z.email().trim().toLowerCase(),
  password: z.string().min(1),
});

// Telegram signs the whole query string, so the only thing to validate here is
// that a non-empty one arrived. Everything inside it is checked by the HMAC.
export const telegramSchema = z.object({
  initData: z.string().min(1),
});

// The Mini App's signup sheet asks for company and phone only — Telegram has
// already identified the user, and the signed initData is the proof. Composed
// from the two schemas above so the rules cannot drift apart.
export const telegramSignupSchema = telegramSchema.extend(
  signupSchema.pick({ company: true, phone: true }).shape,
);

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
