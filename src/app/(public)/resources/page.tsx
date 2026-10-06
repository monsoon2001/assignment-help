import Link from "next/link";
import type { Metadata } from "next";
import { ChevronRight, Search } from "lucide-react";
import { CtaBand, PAGE_TONES } from "@/components/marketing/page-shell";
import ResourceBrowser from "@/components/resources/resource-browser";
import {
  ALL_RESOURCES,
  CATEGORY_BY_SLUG,
  FEATURED_RESOURCES,
  RESOURCE_CATEGORIES,
  guidesByCategory,
  resourcePath,
} from "@/lib/resources";

export const metadata: Metadata = {
  title: "Student Guides & Academic Writing Resources | Acadivo",
  description:
    "Free student guides for essays, reports, research, citations, presentations, and technical coursework. Step-by-step explanations with practical examples and checklists.",
  alternates: { canonical: "https://acadivo.com/resources" },
  openGraph: {
    title: "Student Guides & Academic Writing Resources | Acadivo",
    description:
      "Practical guides for essays, reports, research, citations, presentations, and technical coursework.",
    type: "website",
    url: "https://acadivo.com/resources",
  },
};

export default function ResourcesPage() {
  return (
    <>
      <div className="bg-gradient-to-r from-accent-amber-container/90 via-surface-container-high to-surface-container-low border-b border-outline-variant/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <nav className="flex items-center gap-2 text-sm text-on-surface-variant mb-5">
            <Link href="/" className="hover:text-accent-amber transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-on-surface font-medium">Resources</span>
          </nav>
          <div className="flex items-center gap-3 mb-4">
            <span className="w-10 h-10 bg-white rounded-xl flex items-center justify-center ring-1 ring-accent-amber/25">
              <span className="material-symbols-outlined text-accent-amber">menu_book</span>
            </span>
            <span className="text-sm font-semibold text-accent-amber">Academic guides</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-on-surface mb-4 max-w-3xl">
            Academic Guides That Help You Get Started
          </h1>
          <p className="text-lg text-on-surface-variant max-w-2xl leading-relaxed">
            Practical guides for essays, reports, research, citations, presentations, and technical coursework.
            Every guide explains the process step by step, with practical examples and checklists you can use before
            submitting your work.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 text-sm text-on-surface-variant bg-white/70 rounded-full px-3.5 py-1.5 ring-1 ring-accent-amber/25">
            <Search className="w-4 h-4 text-accent-amber" />
            <span>
              {ALL_RESOURCES.length} free guides, no sign-up required
            </span>
          </div>
        </div>
      </div>

      <section className="py-16 bg-white wash-amber">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-2">
            <span className="h-1 w-10 rounded-full bg-gradient-to-r from-accent-rose to-accent-rose-container" aria-hidden="true" />
            <h2 className="font-display text-2xl font-bold text-on-surface">Featured Guides</h2>
          </div>
          <p className="text-on-surface-variant mb-6">Start with the questions students search for most.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURED_RESOURCES.map((guide, i) => {
              const tone = [PAGE_TONES.rose, PAGE_TONES.amber, PAGE_TONES.violet, PAGE_TONES.teal][i % 4];
              return (
              <Link
                key={guide.slug}
                href={resourcePath(guide)}
                className={`group relative overflow-hidden bg-white rounded-2xl p-6 border ${tone.card} shadow-sm ${tone.cardHover} transition-all`}
              >
                <span className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${tone.hairline}`} aria-hidden="true" />
                <span className={`text-xs font-semibold mb-3 inline-block rounded-full px-3 py-1 ${tone.chip}`}>
                  {CATEGORY_BY_SLUG.get(guide.category)?.name}
                </span>
                <h3 className={`font-display font-bold text-on-surface mb-2 transition-colors ${tone.text}`}>
                  {guide.title}
                </h3>
                <p className="text-sm text-on-surface-variant leading-relaxed line-clamp-3 mb-4">
                  {guide.ogDescription}
                </p>
                <span className={`text-sm font-semibold ${tone.text}`}>Read Guide →</span>
              </Link>
              );
            })}
          </div>
        </section>

        <section className="mb-16">
          <h2 className="font-display text-2xl font-bold text-on-surface mb-6">Browse All Guides</h2>
          <ResourceBrowser />
        </section>

        <section className="border-t border-outline-variant/40 pt-16">
          <h2 className="font-display text-2xl font-bold text-on-surface mb-6">Browse by Category</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {RESOURCE_CATEGORIES.map((category, i) => {
              const count = guidesByCategory(category.slug).length;
              const tone = [PAGE_TONES.amber, PAGE_TONES.teal, PAGE_TONES.violet, PAGE_TONES.rose][i % 4];
              return (
                <Link
                  key={category.slug}
                  href={`/resources/${category.slug}`}
                  className={`group relative overflow-hidden bg-white rounded-2xl p-6 border ${tone.card} shadow-sm ${tone.cardHover} transition-all`}
                >
                  <span className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${tone.hairline}`} aria-hidden="true" />
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${tone.iconTile}`}>
                    <span className={`material-symbols-outlined ${tone.icon}`}>{category.icon}</span>
                  </div>
                  <h3 className={`font-display font-bold text-on-surface mb-1.5 transition-colors ${tone.text}`}>
                    {category.name}
                  </h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed mb-3">{category.description}</p>
                  <p className={`text-xs font-semibold ${tone.text}`}>{count} guides →</p>
                </Link>
              );
            })}
          </div>
        </section>
        </div>
      </section>

      <CtaBand
        eyebrow="school"
        title="Looking for one-to-one help?"
        body="Guides are free. If you would rather work through your assignment with someone, browse verified helpers and choose who you want to work with before you pay."
        primary={{ label: "Find a Helper", href: "/browse-helpers" }}
        secondary={{ label: "How It Works", href: "/how-it-works" }}
      />
    </>
  );
}