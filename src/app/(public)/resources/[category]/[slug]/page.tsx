import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ResourceArticle from "@/components/resources/resource-article";
import { ALL_RESOURCES, CATEGORY_BY_SLUG, getResource } from "@/lib/resources";

type Params = { category: string; slug: string };

export const dynamicParams = false;

export function generateStaticParams() {
  return ALL_RESOURCES.map((resource) => ({
    category: resource.category,
    slug: resource.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { category, slug } = await params;
  const resource = getResource(category, slug);
  if (!resource) return {};

  const url = `https://acadivo.com/resources/${resource.category}/${resource.slug}`;

  return {
    title: resource.seoTitle,
    description: resource.description,
    alternates: { canonical: url },
    openGraph: {
      title: resource.seoTitle,
      description: resource.ogDescription,
      type: "article",
      url,
      siteName: "Acadivo",
    },
    twitter: {
      card: "summary_large_image",
      title: resource.seoTitle,
      description: resource.ogDescription,
    },
  };
}

export default async function ResourcePage({ params }: { params: Promise<Params> }) {
  const { category, slug } = await params;
  const resource = getResource(category, slug);
  if (!resource || !CATEGORY_BY_SLUG.has(category)) notFound();

  return <ResourceArticle resource={resource} />;
}