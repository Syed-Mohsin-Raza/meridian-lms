import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines Tailwind classes with proper precedence.
 * Later classes override earlier ones when they conflict.
 *
 * Why: `clsx` handles conditional logic, `twMerge` resolves conflicting
 * Tailwind utilities (e.g., "p-2 p-4" becomes "p-4").
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
