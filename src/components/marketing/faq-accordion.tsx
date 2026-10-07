"use client";

import { useState } from "react";

type FaqEntry = { q: string; a: string };

/**
 * Single-open FAQ accordion. Native `<details>` let every item stay open at once
 * and, in a two-column grid, left the closed sibling stretched to the height of
 * the open one, so only one question is ever expanded and no empty space shows.
 */
export default function FaqAccordion({
  items,
  columns = 2,
}: {
  items: readonly FaqEntry[];
  columns?: 1 | 2;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className={`grid gap-3 items-start ${columns === 2 ? "lg:grid-cols-2" : ""}`}>
      {items.map((faq, i) => {
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
                <span
                  className={`material-symbols-outlined text-on-surface-variant shrink-0 transition-transform ${
                    open ? "rotate-180" : ""
                  }`}
                >
                  expand_more
                </span>
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
      })}
    </div>
  );
}