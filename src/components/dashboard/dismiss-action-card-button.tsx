"use client";

import { X } from "lucide-react";

export default function DismissActionCardButton({ cardKey }: { cardKey: string }) {
  function dismiss() {
    const stored = localStorage.getItem("hiddenActionCards");
    const hidden: unknown = stored ? JSON.parse(stored) : [];
    if (!Array.isArray(hidden)) {
      throw new Error("Stored hidden action cards must be an array.");
    }

    if (!hidden.includes(cardKey)) {
      localStorage.setItem("hiddenActionCards", JSON.stringify([...hidden, cardKey]));
    }
    window.location.reload();
  }

  return (
    <button
      type="button"
      aria-label="Remove card"
      className="absolute top-2 right-2 z-10 p-1 rounded-full hover:bg-surface-container-high transition-colors"
      onClick={dismiss}
    >
      <X size={14} className="text-on-surface-variant" />
    </button>
  );
}
