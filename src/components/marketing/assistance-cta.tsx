"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { Sparkles, X } from "lucide-react";
import PriceEstimateForm from "@/components/marketing/price-estimate-form";

export default function AssistanceCta() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 text-base font-semibold text-on-primary shadow-lg shadow-primary/25 active:scale-[0.99] transition-transform lg:hidden"
      >
        <Sparkles size={18} />
        Free assistance
      </button>

      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex flex-col lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Free assistance"
          >
            <div
              className="absolute inset-0 bg-black/50 animate-[fade-in_0.15s_ease-out]"
              onClick={() => setOpen(false)}
            />
            <div className="relative mt-auto max-h-[92dvh] overflow-y-auto rounded-t-3xl bg-background border-t border-outline-variant shadow-2xl animate-[sheet-up_0.22s_ease-out] pb-[env(safe-area-inset-bottom)]">
              <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-outline-variant bg-surface-container-lowest px-5 py-4">
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-xl bg-primary-fixed flex items-center justify-center shrink-0">
                    <Sparkles size={18} className="text-primary" />
                  </span>
                  <div>
                    <p className="font-display font-bold text-on-surface leading-tight">
                      Let&apos;s understand your assignment
                    </p>
                    <p className="text-xs text-on-surface-variant">Free estimate — no commitment</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                  className="w-9 h-9 rounded-lg text-on-surface-variant hover:bg-surface-container-low flex items-center justify-center shrink-0"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-5">
                <PriceEstimateForm />
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
