import React from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";

export function LoadingState({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20">
      <Loader2 size={26} className="text-primary animate-spin" />
      <p className="text-sm text-on-surface-variant">{label}</p>
    </div>
  );
}

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