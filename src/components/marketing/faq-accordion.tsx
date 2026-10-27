"use client";

import { useState } from "react";
import { MaterialIcon } from "@/lib/icons-map";
import { accentForIndex } from "@/lib/accent-styles";

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
    const accent = accentForIndex(i);
    const open = openIndex === i;
    return (
      <div
        key={faq.q}
        className={`bg-surface-container-lowest rounded-xl border transition-all duration-300 ${
          open
            ? `${accent.cardHover} shadow-sm`
            : "border-outline-variant/30 bg-white hover:border-outline-variant/60 hover:shadow-sm"
        }`}
      >
        <h3>
          <button
            type="button"
            id={`faq-button-${i}`}
            aria-expanded={open}
            aria-controls={`faq-panel-${i}`}
            onClick={() => setOpenIndex(open ? null : i)}
            className={`w-full flex items-start justify-between gap-4 p-5 cursor-pointer text-left font-display text-base font-bold transition-colors ${open ? accent.text : "text-on-surface"}`}
          >
            <span>{faq.q}</span>
            <MaterialIcon
              name="expand_more"
              size={20}
              className={`shrink-0 transition-transform duration-300 motion-reduce:transition-none ${open ? `${accent.icon} rotate-180` : "text-on-surface-variant"}`}
            />
          </button>
        </h3>
        <div
          id={`faq-panel-${i}`}
          role="region"
          aria-labelledby={`faq-button-${i}`}
          aria-hidden={!open}
          inert={!open}
          className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out motion-reduce:transition-none ${
            open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="min-h-0 overflow-hidden">
            <p className="px-5 pb-5 text-base text-on-surface-variant leading-relaxed">{faq.a}</p>
          </div>
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

  return <div className="grid gap-3 items-start">{items.map((faq, i) => renderItem(faq, i))}</div>;
}
