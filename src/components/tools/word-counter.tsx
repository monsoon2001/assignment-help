"use client";

import { useState, useMemo } from "react";

export default function WordCounter() {
  const [text, setText] = useState("");

  const stats = useMemo(() => {
    const trimmed = text.trim();
    const words = trimmed ? trimmed.split(/\s+/).length : 0;
    const chars = text.length;
    const charsNoSpace = text.replace(/\s/g, "").length;
    const sentences = trimmed ? (trimmed.match(/[.!?]+/g) || []).length : 0;
    const paragraphs = trimmed ? trimmed.split(/\n\s*\n/).filter(Boolean).length : 0;
    const readingMinutes = words === 0 ? 0 : Math.max(1, Math.ceil(words / 200));
    return { words, chars, charsNoSpace, sentences, paragraphs, readingMinutes };
  }, [text]);

  return (
    <div className="space-y-4">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste or type your text here…"
        className="w-full min-h-48 rounded-2xl border border-line bg-surface p-4 text-base text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
      />
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: "Words", value: stats.words },
          { label: "Characters", value: stats.chars },
          { label: "Characters (no spaces)", value: stats.charsNoSpace },
          { label: "Sentences", value: stats.sentences },
          { label: "Paragraphs", value: stats.paragraphs },
          { label: "Reading time (min)", value: stats.readingMinutes },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-outline-variant/30 bg-surface p-3">
            <p className="text-xs text-on-surface-variant">{s.label}</p>
            <p className="font-display text-xl font-bold text-on-surface">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
