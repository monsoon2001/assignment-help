"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Search, Clock, X } from "lucide-react";
import Button from "@/components/ui/button";
import { ALL_RESOURCES, CATEGORY_BY_SLUG, resourcePath } from "@/lib/resources";
import { accentForGuideCategory, accentForIndex } from "@/lib/accent-styles";

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
                ? `${accentForGuideCategory(category.slug).tile} ${accentForGuideCategory(category.slug).text} border border-current`
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
            const accent = accentForIndex(ALL_RESOURCES.indexOf(guide));
            return (
              <Link
                key={guide.slug}
                href={resourcePath(guide)}
                className={`group flex min-h-64 flex-col rounded-2xl border border-outline-variant/40 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${accent.cardHover}`}
              >
                {category && (
                  <span className={`mb-4 self-start rounded-full px-3 py-1 text-xs font-semibold ${accent.tile} ${accent.text}`}>
                    {category.name}
                  </span>
                )}
                <h3 className={`mb-2 font-display font-bold leading-snug transition-colors ${accent.text}`}>
                  {guide.title}
                </h3>
                <p className="mb-4 flex-1 text-base leading-relaxed text-on-surface-variant line-clamp-3">{guide.description}</p>
                <div className="mt-auto flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs text-on-surface-variant">
                    <Clock className="w-3.5 h-3.5" />
                    {guide.readingMinutes} min read
                  </span>
                  <span className={`inline-flex items-center gap-1 text-sm font-semibold ${accent.text}`}>
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
