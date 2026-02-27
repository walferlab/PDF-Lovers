import { clsx, type ClassValue } from "clsx";
import { format } from "date-fns";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date?: string | null, fallback = "Unscheduled") {
  if (!date) {
    return fallback;
  }

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return fallback;
  }

  return format(parsed, "MMM d, yyyy");
}

export function toTitleCase(value: string) {
  return value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(" ");
}

export function isValidUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export function cleanSearchInput(value: string) {
  return value.trim().replace(/[\s]+/g, " ");
}
