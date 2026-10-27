import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Search } from "lucide-react";
import { CtaBand, PageHeader } from "@/components/marketing/page-shell";
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
import { accentForFeaturedGuide, accentForGuideCategory } from "@/lib/accent-styles";

export const metadata: Metadata = {
  title: "Student Guides & Academic Writing Resources | Acadivo",
  description:
    "Free student guides for essays, reports, research, citations, presentations, and technical coursework. Step-by-step explanations with practical examples and checklists.",
  alternates: { canonical: "https://acadivo.com/resources" },
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

      <section className="py-12 sm:py-16 band-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <section className="mb-10 sm:mb-16">
            <h2 className="font-display text-2xl font-bold text-on-surface mb-2">
              Featured Guides
            </h2>
            <p className="text-on-surface-variant mb-6">
              Start with the questions students search for most.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {FEATURED_RESOURCES.map((guide) => {
                const accent = accentForFeaturedGuide(guide.slug, guide.category);
                return (
                  <Link
                    key={guide.slug}
                    href={resourcePath(guide)}
                    className={`group flex min-h-64 flex-col rounded-2xl border border-outline-variant/40 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${accent.cardHover}`}
                  >
                    <div className="mb-4 flex items-center gap-3">
                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${accent.tile}`}
                      >
                        <MaterialIcon
                          name={CATEGORY_BY_SLUG.get(guide.category)?.icon ?? "auto_stories"}
                          size={20}
                          className={accent.icon}
                        />
                      </span>
                      <span className={`text-xs font-semibold ${accent.text}`}>
                        {CATEGORY_BY_SLUG.get(guide.category)?.name}
                      </span>
                    </div>
                    <h3
                      className={`mb-2 font-display font-bold leading-snug transition-colors ${accent.text}`}
                    >
                      {guide.title}
                    </h3>
                    <p className="mb-4 flex-1 text-base leading-relaxed text-on-surface-variant line-clamp-3">
                      {guide.ogDescription}
                    </p>
                    <span
                      className={`inline-flex items-center gap-1.5 text-sm font-semibold ${accent.text}`}
                    >
                      Read guide{" "}
                      <ArrowRight
                        size={15}
                        className="transition-transform group-hover:translate-x-0.5"
                      />
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>

          <section className="mb-10 sm:mb-16">
            <h2 className="font-display text-2xl font-bold text-on-surface mb-6">
              Browse All Guides
            </h2>
            <ResourceBrowser />
          </section>

          <section className="border-t border-outline-variant/40 pt-16">
            <h2 className="font-display text-2xl font-bold text-on-surface mb-6">
              Browse by Category
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {RESOURCE_CATEGORIES.map((category) => {
                const count = guidesByCategory(category.slug).length;
                const accent = accentForGuideCategory(category.slug);
                return (
                  <Link
                    key={category.slug}
                    href={`/resources/${category.slug}`}
                    className={`group flex min-h-64 flex-col rounded-2xl border border-outline-variant/40 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${accent.cardHover}`}
                  >
                    <div
                      className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${accent.tile}`}
                    >
                      <MaterialIcon name={category.icon} size={24} className={accent.icon} />
                    </div>
                    <h3
                      className={`mb-1.5 font-display font-bold transition-colors ${accent.text}`}
                    >
                      {category.name}
                    </h3>
                    <p className="mb-4 flex-1 text-base leading-relaxed text-on-surface-variant">
                      {category.description}
                    </p>
                    <p
                      className={`inline-flex items-center gap-1.5 text-sm font-semibold ${accent.text}`}
                    >
                      {count} guides{" "}
                      <ArrowRight
                        size={15}
                        className="transition-transform group-hover:translate-x-0.5"
                      />
                    </p>
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
        body="Guides are free. If you would rather work through your assignment with someone, send your brief and our verified helper will quote your scope before you pay."
        primary={{ label: "Request Help", href: "/requests/new" }}
        secondary={{ label: "How It Works", href: "/how-it-works" }}
      />
    </>
  );
}
