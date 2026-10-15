import type { ReactNode } from "react";
import type { StatusTone } from "@/lib/status-meta";

export type { StatusTone };

/* Exact text/background pairs from the colour system. Defined once here so
   every student, helper and admin screen shows the same status colours. */
const TONES: Record<StatusTone, string> = {
  slate: "bg-tone-slate-bg text-tone-slate",
  blue: "bg-tone-blue-bg text-tone-blue",
  blueStrong: "bg-tone-blue-strong-bg text-tone-blue-strong",
  amber: "bg-tone-amber-bg text-tone-amber",
  orange: "bg-tone-orange-bg text-tone-orange",
  indigo: "bg-tone-indigo-bg text-tone-indigo",
  green: "bg-tone-green-bg text-tone-green",
  red: "bg-tone-red-bg text-tone-red",
};

interface StatusBadgeProps {
  tone: StatusTone;
  children: ReactNode;
  className?: string;
  dot?: boolean;
}

/**
 * The one badge used for every status across the app. The text label is always
 * rendered alongside the colour, so meaning never relies on colour alone.
 */
export default function StatusBadge({
  tone,
  children,
  className = "",
  dot = false,
}: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${TONES[tone]} ${className}`}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}
