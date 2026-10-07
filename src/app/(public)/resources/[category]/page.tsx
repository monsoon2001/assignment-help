import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { PAGE_TONES, PageHeader } from "@/components/marketing/page-shell";
import { CATEGORY_BY_SLUG, RESOURCE_CATEGORIES, guidesByCategory } from "@/lib/resources";

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
    openGraph: {
      title: `${known.name} Guides | Acadivo`,
      description: known.description,
      type: "website",
      url: `https://acadivo.com/resources/${known.slug}`,
    },
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
        tone="amber"
        icon={known.icon}
        eyebrow="Guides"
        title={`${known.name} Guides`}
        subtitle={known.description}
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Resources", href: "/resources" },
          { label: known.name },
        ]}
      />

      <section className="py-16 band-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {guides.map((guide) => {
              const tone = PAGE_TONES.blue;
              return (
              <Link
                key={guide.slug}
                href={`/resources/${guide.category}/${guide.slug}`}
                className={`group relative overflow-hidden bg-white rounded-2xl p-6 border ${tone.card} shadow-sm ${tone.cardHover} transition-all`}
              >
                <span className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${tone.hairline}`} aria-hidden="true" />
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs font-semibold ${tone.text}`}>{guide.readingMinutes} min read</span>
                </div>
                <h2 className={`font-display font-bold text-on-surface mb-2 transition-colors ${tone.text}`}>
                  {guide.title}
                </h2>
                <p className="text-base text-on-surface-variant leading-relaxed line-clamp-3">{guide.description}</p>
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
              href="/browse-helpers"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-container text-white rounded-xl font-semibold text-sm hover:opacity-95 transition-opacity shadow-md shadow-primary-container/20"
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
