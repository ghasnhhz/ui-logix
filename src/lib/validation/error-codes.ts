import type { z } from "zod";

// Zod's messages are English strings generated from the schema, so they must
// never reach a user. Every failure — a zod issue or a domain rule — collapses to
// one of these codes, and the client looks the code up in the `errors` namespace.
export type ErrorCode =
  | "required"
  | "invalidEmail"
  | "invalidDate"
  | "tooShort"
  | "tooLong"
  | "outOfRange"
  | "invalidOption"
  | "invalid"
  | "emailTaken"
  | "quoteExpired"
  | "alreadyBooked"
  | "carrierUnavailable"
  | "notYourQuote";

const FORMAT_CODES: Record<string, ErrorCode> = {
  email: "invalidEmail",
  date: "invalidDate",
  datetime: "invalidDate",
};

const isEmpty = (issue: z.core.$ZodIssue) =>
  issue.input === undefined || issue.input === null || issue.input === "";

export function issueCode(issue: z.core.$ZodIssue): ErrorCode {
  switch (issue.code) {
    case "invalid_type":
      // A missing key and a cleared numeric input both land here — undefined for
      // the first, NaN for the second — and both read as "required" to a user.
      return "required";
    case "too_small":
      if (isEmpty(issue)) return "required";
      return issue.origin === "string" ? "tooShort" : "outOfRange";
    case "too_big":
      return issue.origin === "string" ? "tooLong" : "outOfRange";
    case "invalid_format":
      return FORMAT_CODES[issue.format] ?? "invalid";
    case "invalid_value":
    case "invalid_union":
      return "invalidOption";
    default:
      return "invalid";
  }
}
