"use client";

import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PasswordRule {
  id: string;
  label: string;
  test: (password: string) => boolean;
}

export const PASSWORD_RULES: PasswordRule[] = [
  {
    id: "length",
    label: "At least 8 characters",
    test: (p) => p.length >= 8,
  },
  {
    id: "uppercase",
    label: "One uppercase letter (A-Z)",
    test: (p) => /[A-Z]/.test(p),
  },
  {
    id: "lowercase",
    label: "One lowercase letter (a-z)",
    test: (p) => /[a-z]/.test(p),
  },
  {
    id: "digit",
    label: "One number (0-9)",
    test: (p) => /[0-9]/.test(p),
  },
  {
    id: "special",
    label: "One special character (!@#$%^&*)",
    test: (p) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(p),
  },
];

export function isPasswordStrong(password: string): boolean {
  return PASSWORD_RULES.every((rule) => rule.test(password));
}

interface PasswordStrengthProps {
  password: string;
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  if (!password) return null;

  return (
    <ul className="space-y-1" role="list">
      {PASSWORD_RULES.map((rule) => {
        const passes = rule.test(password);
        return (
          <li
            key={rule.id}
            className={cn(
              "flex items-center gap-2 text-xs transition-colors",
              passes ? "text-emerald-600" : "text-muted-foreground"
            )}
          >
            {passes ? (
              <Check className="h-3.5 w-3.5 shrink-0" />
            ) : (
              <X className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
            )}
            <span>{rule.label}</span>
          </li>
        );
      })}
    </ul>
  );
}
