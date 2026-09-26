import { z } from "zod";
import { PASSWORD_RULES } from "@/components/auth/password-strength";

/**
 * Strong password schema — mirrors the client-side rules shown by
 * <PasswordStrength />. This is defense-in-depth: even if the UI is
 * bypassed, the schema rejects weak passwords before they hit the API.
 *
 * Backend enforces length only. This is stricter on purpose.
 */
export const strongPasswordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password must be at most 72 characters")
  .refine(
    (p) => PASSWORD_RULES.every((rule) => rule.test(p)),
    "Password does not meet all strength requirements"
  );
