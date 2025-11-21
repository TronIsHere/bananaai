import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Plan type definitions
export type PlanType = "free" | "explorer" | "creator" | "studio" | null;

// Plan translation utilities
const PLAN_TRANSLATIONS: Record<string, string> = {
  free: "رایگان",
  explorer: "کاوشگر",
  creator: "خلاق",
  studio: "استودیو",
};

const REVERSE_PLAN_TRANSLATIONS: Record<string, PlanType> = {
  "رایگان": "free",
  "کاوشگر": "explorer",
  "خلاق": "creator",
  "استودیو": "studio",
};

/**
 * Convert English plan name to Persian for display
 */
export function getPlanNamePersian(plan: PlanType): string {
  if (!plan) return "";
  return PLAN_TRANSLATIONS[plan] || plan;
}

/**
 * Convert Persian plan name to English for storage
 */
export function getPlanNameEnglish(plan: string | null): PlanType {
  if (!plan) return null;
  return REVERSE_PLAN_TRANSLATIONS[plan] || (plan as PlanType);
}
