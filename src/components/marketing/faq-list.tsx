"use client";

import { useState } from "react";
import { PAGE_TONES } from "@/components/marketing/page-shell";
import { MaterialIcon } from "@/lib/icons-map";

type FaqEntry = { q: string; a: string };

export default function FaqList({ items }: { items: readonly FaqEntry[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const renderItem = (faq: FaqEntry, i: number) => {
    const tone = PAGE_TONES.blue;
    const open = openIndex === i;
    return (
      <div
        key={faq.q}
        className={`bg-white rounded-xl border overflow-hidden transition-all ${open ? `${tone.card} shadow-md` : `${tone.card} shadow-sm ${tone.cardHover}`}`}
      >
        <button
          onClick={() => setOpenIndex(open ? null : i)}
          aria-expanded={open}
          className={`w-full flex items-center justify-between p-5 text-left cursor-pointer transition-colors ${open ? tone.iconTile : "hover:bg-surface-container-low/50"}`}
        >
          <span className={`font-semibold pr-4 ${open ? tone.text : "text-on-surface"}`}>{faq.q}</span>
          <MaterialIcon
            name="expand_more"
            size={20}
            className={`shrink-0 transition-transform ${open ? tone.icon : "text-on-surface-variant"} ${open ? "rotate-180" : ""}`}
          />
        </button>
        {open && (
          <div className="px-5 pb-5 text-sm text-on-surface-variant leading-relaxed border-t border-outline-variant/30 pt-4">
            {faq.a}
          </div>
        )}
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