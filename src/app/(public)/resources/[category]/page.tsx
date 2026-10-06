import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ChevronRight, ArrowRight } from "lucide-react";
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
      <div className="bg-surface-container-high border-b border-outline-variant/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <nav className="flex items-center gap-2 text-sm text-on-surface-variant mb-4">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/resources" className="hover:text-primary transition-colors">Resources</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-on-surface font-medium">{known.name}</span>
          </nav>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-on-surface mb-2">{known.name} Guides</h1>
          <p className="text-on-surface-variant max-w-2xl">{known.description}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {guides.map((guide) => (
            <Link
              key={guide.slug}
              href={`/resources/${guide.category}/${guide.slug}`}
              className="group bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30 hover:shadow-md hover:border-primary-container/40 transition-all"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs text-on-surface-variant">{guide.readingMinutes} min read</span>
              </div>
              <h2 className="font-display font-bold text-on-surface mb-2 group-hover:text-primary transition-colors">
                {guide.title}
              </h2>
              <p className="text-sm text-on-surface-variant leading-relaxed line-clamp-3">{guide.description}</p>
            </Link>
          ))}
        </div>

        <div className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/resources"
            className="inline-flex items-center gap-2 px-6 py-3 border border-outline-variant rounded-xl font-semibold text-sm text-on-surface hover:bg-surface-container-low transition-colors"
          >
            All guides
          </Link>
          <Link
            href="/browse-helpers"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-container text-on-primary rounded-xl font-semibold text-sm hover:bg-primary transition-colors"
          >
            Looking for one-to-one help?
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </>
  );
}