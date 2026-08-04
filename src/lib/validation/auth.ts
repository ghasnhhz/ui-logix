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

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
