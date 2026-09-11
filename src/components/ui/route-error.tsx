"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/states";

export default function RouteError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="w-full max-w-3xl mx-auto">
      <ErrorState
        title="Something went wrong"
        message={error.message ?? "An unexpected error occurred while loading this page."}
        retry={retry}
      />
    </div>
  );
}