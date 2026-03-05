import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind CSS classes safely.
 * Handles conditional classes and resolves conflicts.
 * Used by all Shadcn UI components.
 *
 * Usage:
 *   cn("px-4 py-2", isActive && "bg-blue-500", "text-white")
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}