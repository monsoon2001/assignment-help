import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/marketing/page-shell";
import { CATEGORY_BY_SLUG, RESOURCE_CATEGORIES, guidesByCategory } from "@/lib/resources";
import { accentForIndex } from "@/lib/accent-styles";

type Params = { category: string };

export const dynamicParams = false;

export function generateStaticParams() {
  return RESOURCE_CATEGORIES.map((category) => ({ category: category.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { category } = await params;
  const known = CATEGORY_BY_SLUG.get(category);
  if (!known) return {};

  return {
    title: `${known.name} Guides | Acadivo`,
    description: `${known.description} Browse all ${known.name.toLowerCase()} guides on Acadivo.`,
    alternates: { canonical: `https://acadivo.com/resources/${known.slug}` },
  };
}

export default async function CategoryPage({ params }: { params: Promise<Params> }) {
  const { category } = await params;
  const known = CATEGORY_BY_SLUG.get(category);
  if (!known) notFound();

  const guides = guidesByCategory(category);

  return (
    <>
      <PageHeader
        title={`${known.name} Guides`}
        subtitle={known.description}
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Resources", href: "/resources" },
          { label: known.name },
        ]}
      />

      <section className="py-12 sm:py-16 band-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {guides.map((guide, index) => {
              const accent = accentForIndex(index);
              return (
              <Link
                key={guide.slug}
                href={`/resources/${guide.category}/${guide.slug}`}
                className={`group flex min-h-56 flex-col rounded-2xl border border-outline-variant/40 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${accent.cardHover}`}
              >
                <div className="mb-3 flex items-center gap-2">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${accent.tile} ${accent.text}`}>{guide.readingMinutes} min read</span>
                </div>
                <h2 className={`mb-2 font-display font-bold leading-snug transition-colors ${accent.text}`}>
                  {guide.title}
                </h2>
                <p className="mb-4 flex-1 text-base leading-relaxed text-on-surface-variant line-clamp-3">{guide.description}</p>
                <span className={`inline-flex items-center gap-1.5 text-sm font-semibold ${accent.text}`}>
                  Read guide <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
              );
            })}
          </div>

          <div className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/resources"
              className="inline-flex items-center gap-2 px-6 py-3 border border-outline-variant bg-white rounded-xl font-semibold text-sm text-on-surface hover:bg-surface-container-low transition-colors"
            >
              All guides
            </Link>
            <Link
              href="/requests/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl font-semibold text-sm hover:opacity-95 transition-opacity shadow-md shadow-primary-container/20"
            >
              Looking for one-to-one help?
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
