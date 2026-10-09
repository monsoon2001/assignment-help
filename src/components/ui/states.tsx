import React from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";

export function ErrorState({
  title = "Something went wrong",
  message,
  retry,
}: {
  title?: string;
  message?: string;
  retry?: () => void;
}) {
  return (
    <Card className="flex flex-col items-center gap-3 p-10 text-center">
      <span className="w-12 h-12 rounded-2xl bg-error-container/40 flex items-center justify-center">
        <AlertTriangle size={22} className="text-error" />
      </span>
      <h3 className="font-semibold text-on-surface">{title}</h3>
      {message && <p className="text-sm text-on-surface-variant max-w-md">{message}</p>}
      {retry && (
        <Button variant="outline" onClick={retry}>
          Try again
        </Button>
      )}
    </Card>
  );
}

export function EmptyState({
  icon,
  title,
  message,
  actionHref,
  actionLabel,
}: {
  icon?: React.ReactNode;
  title: string;
  message?: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <Card className="flex flex-col items-center gap-3 p-12 text-center">
      {icon && <span className="w-14 h-14 rounded-2xl bg-primary-container/10 flex items-center justify-center">{icon}</span>}
      <h3 className="font-semibold text-on-surface">{title}</h3>
      {message && <p className="text-sm text-on-surface-variant max-w-sm">{message}</p>}
      {actionHref && actionLabel && (
        <a href={actionHref}>
          <Button variant="outline">{actionLabel}</Button>
        </a>
      )}
    </Card>
  );
}

/** Compact empty state for side panels and cards that sit inside a larger layout. */
export function PanelEmpty({
  icon,
  title,
  message,
  actionHref,
  actionLabel,
}: {
  icon?: React.ReactNode;
  title: string;
  message?: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-8 text-center">
      {icon && (
        <span className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-on-surface-variant">
          {icon}
        </span>
      )}
      <p className="text-sm font-semibold text-on-surface">{title}</p>
      {message && <p className="text-xs text-on-surface-variant max-w-xs leading-relaxed">{message}</p>}
      {actionHref && actionLabel && (
        <Link href={actionHref} className="mt-1 text-xs font-semibold text-primary inline-flex items-center min-h-11 gap-1 hover:underline">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}