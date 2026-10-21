import { z } from "zod";
import { API_USE_CASES, MAX_REQUESTED_RATE_LIMIT } from "#lib/shared/constants/developer";

// Shared so the request form can preflight with the same rules the server enforces.
export const apiKeyRequestSchema = z.object({
  // Better Auth's default maximum API key name length is 32.
  name: z.string().trim().min(3, "Use at least 3 characters.").max(32, "Use at most 32 characters."),
  useCase: z.enum(
    API_USE_CASES.map(({ value }) => value),
    "Choose what you’re building."
  ),
  url: z
    .url({ protocol: /^https?$/, hostname: z.regexes.domain, error: "Enter a full http(s) link." })
    .max(300, "Use a shorter link."),
  description: z
    .string()
    .trim()
    .min(30, "Tell us a bit more (at least 30 characters).")
    .max(1000, "Keep it under 1000 characters."),
  // Unchecked checkboxes aren't submitted, so the field must default before it can be required.
  acceptTerms: z
    .boolean()
    .default(false)
    .refine((accepted) => accepted, "Accept the policies to continue."),
  // Underscore: never echoed back into the form, and tokens are single-use anyway.
  _captchaToken: z.string("Complete the captcha.").min(1, "Complete the captcha.").max(2048)
});

export const rateLimitRequestSchema = z.object({
  requestedMax: z
    .number("Enter a number of requests.")
    .int("Use a whole number.")
    .positive("Use a positive number.")
    .max(MAX_REQUESTED_RATE_LIMIT, `Ask for at most ${MAX_REQUESTED_RATE_LIMIT.toLocaleString("en-US")} requests.`),
  reason: z
    .string()
    .trim()
    .min(30, "Tell us a bit more (at least 30 characters).")
    .max(1000, "Keep it under 1000 characters.")
});
