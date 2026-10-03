import Link from "next/link";
import type { Metadata } from "next";
import { ChevronRight, ArrowRight, Search } from "lucide-react";
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
  title: "Student Guides & Academic Writing Resources | Acadibo",
  description:
    "Free student guides for essays, reports, research, citations, presentations, and technical coursework. Step-by-step explanations with practical examples and checklists.",
  alternates: { canonical: "https://acadibo.com/resources" },
  openGraph: {
    title: "Student Guides & Academic Writing Resources | Acadibo",
    description:
      "Practical guides for essays, reports, research, citations, presentations, and technical coursework.",
    type: "website",
    url: "https://acadibo.com/resources",
  },
};

export default function ResourcesPage() {
  return (
    <>
      <div className="bg-surface-container-high border-b border-outline-variant/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <nav className="flex items-center gap-2 text-sm text-on-surface-variant mb-5">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-on-surface font-medium">Resources</span>
          </nav>
          <div className="flex items-center gap-3 mb-4">
            <span className="w-10 h-10 bg-primary-container/20 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">menu_book</span>
            </span>
            <span className="text-sm font-medium text-primary">Academic guides</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-on-surface mb-4 max-w-3xl">
            Academic Guides That Help You Get Started
          </h1>
          <p className="text-lg text-on-surface-variant max-w-2xl leading-relaxed">
            Practical guides for essays, reports, research, citations, presentations, and technical coursework.
            Every guide explains the process step by step, with practical examples and checklists you can use before
            submitting your work.
          </p>
          <div className="mt-6 flex items-center gap-2 text-sm text-on-surface-variant">
            <Search className="w-4 h-4" />
            <span>
              {ALL_RESOURCES.length} free guides, no sign-up required
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <section className="mb-16">
          <h2 className="font-display text-2xl font-bold text-on-surface mb-2">Featured Guides</h2>
          <p className="text-on-surface-variant mb-6">Start with the questions students search for most.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURED_RESOURCES.map((guide) => (
              <Link
                key={guide.slug}
                href={resourcePath(guide)}
                className="group bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30 hover:shadow-md hover:border-primary-container/40 transition-all"
              >
                <span className="text-xs font-medium text-primary mb-3 inline-block bg-primary-container/10 rounded-full px-3 py-1">
                  {CATEGORY_BY_SLUG.get(guide.category)?.name}
                </span>
                <h3 className="font-display font-bold text-on-surface mb-2 group-hover:text-primary transition-colors">
                  {guide.title}
                </h3>
                <p className="text-sm text-on-surface-variant leading-relaxed line-clamp-3 mb-4">
                  {guide.ogDescription}
                </p>
                <span className="text-sm font-medium text-primary">Read Guide →</span>
              </Link>
            ))}
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
              return (
                <Link
                  key={category.slug}
                  href={`/resources/${category.slug}`}
                  className="group bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30 hover:shadow-md hover:border-primary-container/40 transition-all"
                >
                  <div className="w-11 h-11 bg-primary-container/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-container/20 transition-colors">
                    <span className="material-symbols-outlined text-primary">{category.icon}</span>
                  </div>
                  <h3 className="font-display font-bold text-on-surface mb-1.5 group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed mb-3">{category.description}</p>
                  <p className="text-xs font-medium text-primary">{count} guides →</p>
                </Link>
              );
            })}
          </div>
        </section>
      </div>

      <section className="bg-surface-container-high border-t border-outline-variant/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14 text-center">
          <h2 className="font-display text-2xl font-bold text-on-surface mb-3">Looking for one-to-one help?</h2>
          <p className="text-on-surface-variant mb-6">
            Guides are free. If you would rather work through your assignment with someone, browse verified helpers and
            choose who you want to work with before you pay.
          </p>
          <Link
            href="/browse-helpers"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-container text-on-primary rounded-xl font-semibold text-sm hover:bg-primary transition-colors"
          >
            Find a Helper
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </>
  );
}