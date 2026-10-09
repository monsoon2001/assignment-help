import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Search } from "lucide-react";
import { CtaBand, PAGE_TONES, PageHeader } from "@/components/marketing/page-shell";
import { MaterialIcon } from "@/lib/icons-map";
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
      <PageHeader
        title="Academic Guides That Help You Get Started"
        subtitle="Practical guides for essays, reports, research, citations, presentations, and technical coursework. Every guide explains the process step by step, with practical examples and checklists."
        crumbs={[{ label: "Home", href: "/" }, { label: "Resources" }]}
      />

      <div className="bg-white border-b border-outline-variant/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
          <span className="inline-flex items-center gap-2 text-sm rounded-full px-3.5 py-1.5 bg-white ring-1 ring-outline-variant/50 text-on-surface-variant">
            <Search className="w-4 h-4" />
            {ALL_RESOURCES.length} free guides, no sign-up required
          </span>
        </div>
      </div>


      <section className="py-16 band-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-2">
            <span className="h-1 w-10 rounded-full bg-gradient-to-r from-primary-container to-primary-fixed" aria-hidden="true" />
            <h2 className="font-display text-2xl font-bold text-on-surface">Featured Guides</h2>
          </div>
          <p className="text-on-surface-variant mb-6">Start with the questions students search for most.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURED_RESOURCES.map((guide) => {
              const tone = PAGE_TONES.blue;
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
                <p className="text-base text-on-surface-variant leading-relaxed line-clamp-3 mb-4">
                  {guide.ogDescription}
                </p>
                <span className={`text-sm font-semibold ${tone.text}`}>Read Guide <ArrowRight size={14} className="inline-block -mt-0.5" /></span>
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
            {RESOURCE_CATEGORIES.map((category) => {
              const count = guidesByCategory(category.slug).length;
              const tone = PAGE_TONES.blue;
              return (
                <Link
                  key={category.slug}
                  href={`/resources/${category.slug}`}
                  className={`group relative overflow-hidden bg-white rounded-2xl p-6 border ${tone.card} shadow-sm ${tone.cardHover} transition-all`}
                >
                  <span className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${tone.hairline}`} aria-hidden="true" />
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${tone.iconTile}`}>
                    <MaterialIcon name={category.icon} size={24} className={tone.icon} />
                  </div>
                  <h3 className={`font-display font-bold text-on-surface mb-1.5 transition-colors ${tone.text}`}>
                    {category.name}
                  </h3>
                  <p className="text-base text-on-surface-variant leading-relaxed mb-3">{category.description}</p>
                  <p className={`text-xs font-semibold ${tone.text}`}>{count} guides <ArrowRight size={12} className="inline-block -mt-0.5" /></p>
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
