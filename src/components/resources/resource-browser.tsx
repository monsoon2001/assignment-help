"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Search, Clock, X } from "lucide-react";
import Button from "@/components/ui/button";
import { ALL_RESOURCES, CATEGORY_BY_SLUG, resourcePath } from "@/lib/resources";
import { PAGE_TONES } from "@/components/marketing/page-shell";

const TONE = PAGE_TONES.blue;

export default function ResourceBrowser() {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<string | null>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ALL_RESOURCES.filter((guide) => {
      const matchesCategory = !active || guide.category === active;
      if (!q) return matchesCategory;
      const haystack = `${guide.title} ${guide.description} ${guide.category}`.toLowerCase();
      return matchesCategory && haystack.includes(q);
    });
  }, [query, active]);

  return (
    <div>
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant pointer-events-none" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="What do you need help with?"
          aria-label="Search academic guides"
          className="w-full pl-12 pr-11 py-3.5 bg-surface-container-lowest border border-outline-variant rounded-xl text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-surface-container-low transition-colors"
          >
            <X className="w-4 h-4 text-on-surface-variant" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        <button
          type="button"
          onClick={() => setActive(null)}
          aria-pressed={active === null}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            active === null
              ? "bg-primary text-on-primary border border-primary"
              : "bg-white border border-outline-variant/60 text-on-surface-variant hover:border-primary-container hover:text-primary"
          }`}
        >
          All
        </button>
        {[...CATEGORY_BY_SLUG.values()].map((category) => (
          <button
            key={category.slug}
            type="button"
            onClick={() => setActive(active === category.slug ? null : category.slug)}
            aria-pressed={active === category.slug}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              active === category.slug
                ? "bg-primary text-on-primary border border-primary"
                : "bg-white border border-outline-variant/60 text-on-surface-variant hover:border-primary-container hover:text-primary"
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      <p className="text-base text-on-surface-variant mb-6 leading-relaxed">
        {results.length} {results.length === 1 ? "guide" : "guides"}
      </p>

      {results.length === 0 ? (
        <div className="text-center py-16 bg-surface-container-lowest rounded-2xl border border-outline-variant/30">
          <p className="font-display text-lg font-bold text-on-surface mb-2">No guides match that search</p>
          <p className="text-on-surface-variant mb-6">Try a different keyword, or clear the filters.</p>
          <Button
            type="button"
            onClick={() => {
              setQuery("");
              setActive(null);
            }}
          >
            Reset search
          </Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((guide) => {
            const category = CATEGORY_BY_SLUG.get(guide.category);
            const tone = TONE;
            return (
              <Link
                key={guide.slug}
                href={resourcePath(guide)}
                className={`group relative flex flex-col overflow-hidden bg-white rounded-2xl p-6 pt-7 border ${tone.card} shadow-sm ${tone.cardHover} transition-all`}
              >
                <span className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${tone.hairline}`} aria-hidden="true" />
                {category && (
                  <span className={`text-xs font-semibold mb-3 self-start rounded-full px-3 py-1 ${tone.chip}`}>
                    {category.name}
                  </span>
                )}
                <h3 className={`font-display font-bold text-on-surface mb-2 transition-colors ${tone.text}`}>
                  {guide.title}
                </h3>
                <p className="text-base text-on-surface-variant leading-relaxed line-clamp-3 mb-4">{guide.description}</p>
                <div className="mt-auto flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs text-on-surface-variant">
                    <Clock className="w-3.5 h-3.5" />
                    {guide.readingMinutes} min read
                  </span>
                  <span className={`text-sm font-semibold sm:opacity-0 sm:group-hover:opacity-100 transition-opacity ${tone.text}`}>
                    Read Guide <ArrowRight size={14} className="inline-block -mt-0.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
