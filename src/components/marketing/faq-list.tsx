"use client";

import { useState } from "react";
import { PAGE_TONES } from "@/components/marketing/page-shell";
import { MaterialIcon } from "@/lib/icons-map";

type FaqEntry = { q: string; a: string };

export default function FaqList({ items }: { items: readonly FaqEntry[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const renderItem = (faq: FaqEntry, i: number) => {
    const tone = PAGE_TONES.blue;
    const open = openIndex === i;
    return (
      <div
        key={faq.q}
        className={`bg-white rounded-xl border overflow-hidden transition-all ${open ? `${tone.card} shadow-md` : `${tone.card} shadow-sm ${tone.cardHover}`}`}
      >
        <button
          type="button"
          id={`faq-page-button-${i}`}
          aria-controls={`faq-page-panel-${i}`}
          onClick={() => setOpenIndex(open ? null : i)}
          aria-expanded={open}
          className={`w-full flex items-center justify-between p-5 text-left cursor-pointer transition-colors ${open ? tone.iconTile : "hover:bg-surface-container-low/50"}`}
        >
          <span className={`font-semibold pr-4 ${open ? tone.text : "text-on-surface"}`}>{faq.q}</span>
          <MaterialIcon
            name="expand_more"
            size={20}
            className={`shrink-0 transition-transform duration-300 motion-reduce:transition-none ${open ? tone.icon : "text-on-surface-variant"} ${open ? "rotate-180" : ""}`}
          />
        </button>
        <div
          id={`faq-page-panel-${i}`}
          role="region"
          aria-labelledby={`faq-page-button-${i}`}
          aria-hidden={!open}
          inert={!open}
          className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out motion-reduce:transition-none ${
            open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="min-h-0 overflow-hidden">
            <div className="border-t border-outline-variant/30 px-5 pb-5 pt-4 text-sm text-on-surface-variant leading-relaxed">
              {faq.a}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const half = Math.ceil(items.length / 2);
  return (
    <div className="grid gap-3 items-start md:grid-cols-2">
      <div className="flex flex-col gap-3">
        {items.slice(0, half).map((faq, i) => renderItem(faq, i))}
      </div>
      <div className="flex flex-col gap-3">
        {items.slice(half).map((faq, i) => renderItem(faq, half + i))}
      </div>
    </div>
  );
}