"use client";

import { useState } from "react";
import { MaterialIcon } from "@/lib/icons-map";

type FaqEntry = { q: string; a: string };

/**
 * Single-open FAQ accordion. In a two-column layout the items are split into two
 * independent flex columns, so expanding one question never grows the grid row
 * and never stretches or pushes questions in the neighboring column.
 */
export default function FaqAccordion({
  items,
  columns = 2,
}: {
  items: readonly FaqEntry[];
  columns?: 1 | 2;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const renderItem = (faq: FaqEntry, i: number) => {
    const open = openIndex === i;
    return (
      <div
        key={faq.q}
        className={`bg-surface-container-lowest rounded-xl border transition-colors ${
          open ? "border-outline-variant/50 shadow-sm shadow-primary-container/20" : "border-outline-variant/30 bg-white"
        }`}
      >
        <h3>
          <button
            type="button"
            id={`faq-button-${i}`}
            aria-expanded={open}
            aria-controls={`faq-panel-${i}`}
            onClick={() => setOpenIndex(open ? null : i)}
            className={`w-full flex items-start justify-between gap-4 p-5 cursor-pointer text-left font-display text-base font-bold transition-colors ${open ? "text-primary" : "text-on-surface"}`}
          >
            <span>{faq.q}</span>
            <MaterialIcon
              name="expand_more"
              size={20}
              className={`text-on-surface-variant shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
            />
          </button>
        </h3>
        <div
          id={`faq-panel-${i}`}
          role="region"
          aria-labelledby={`faq-button-${i}`}
          hidden={!open}
          className="px-5 pb-5 text-base text-on-surface-variant leading-relaxed"
        >
          {faq.a}
        </div>
      </div>
    );
  };

  if (columns === 2) {
    const half = Math.ceil(items.length / 2);
    return (
      <div className="grid gap-3 items-start lg:grid-cols-2">
        <div className="flex flex-col gap-3">
          {items.slice(0, half).map((faq, i) => renderItem(faq, i))}
        </div>
        <div className="flex flex-col gap-3">
          {items.slice(half).map((faq, i) => renderItem(faq, half + i))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-3 items-start">
      {items.map((faq, i) => renderItem(faq, i))}
    </div>
  );
}