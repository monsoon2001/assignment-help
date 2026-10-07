import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle, ChevronRight } from "lucide-react";
import {
  GUIDE_BY_SERVICE,
  SERVICE_PAGES,
  getServicePage,
} from "@/lib/services";
import { STEPS } from "@/lib/home-content";
import { ALL_RESOURCES, resourcePath } from "@/lib/resources";
import { CtaBand } from "@/components/marketing/page-shell";

const SITE_URL = "https://acadivo.com";

export const dynamicParams = false;

export function generateStaticParams() {
  return SERVICE_PAGES.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = getServicePage(slug);
  if (!service) return {};
  const title = `${service.name} Assignment Help | Acadivo`;
  const description = `${service.desc} Compare verified helpers, agree the scope and price in writing, and pay only once the proposal looks right.`;
  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/services/${service.slug}` },
    openGraph: { title, description, type: "website", url: `${SITE_URL}/services/${service.slug}` },
  };
}

const INCLUDED = [
  "A helper verified in the subject and help type you need",
  "Scope, timeline and price agreed in writing before you pay",
  "Unlimited revisions within the agreed scope",
  "Guidance and feedback you build on — you keep the authorship",
];

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = getServicePage(slug);
  if (!service) notFound();

  const guideHref = GUIDE_BY_SERVICE[service.name];
  const guide = ALL_RESOURCES.find((resource) => resourcePath(resource) === guideHref);
  const siblings = service.group.services.filter((item) => item.slug !== service.slug);

  return (
    <>
      <div className="bg-gradient-to-r from-primary-fixed/50 via-white to-white border-b border-outline-variant/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <nav className="flex flex-wrap items-center gap-2 text-sm text-on-surface-variant mb-4">
            <Link href="/" className="text-primary transition-colors">
              Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href="/services" className="text-primary transition-colors">
              Services
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link
              href={`/services#${service.group.id}`}
              className="text-primary transition-colors"
            >
              {service.group.title}
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-on-surface font-medium">{service.name}</span>
          </nav>

          <div className="flex items-start gap-4">
            <span className="w-12 h-12 rounded-xl bg-white text-primary ring-1 ring-primary-container/40 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined">{service.group.icon}</span>
            </span>
            <div>
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-on-surface mb-3">
                {service.name} Assignment Help
              </h1>
              <p className="text-lg text-on-surface-variant max-w-3xl leading-relaxed">{service.desc}</p>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link
              href="/#estimate"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary-container text-white rounded-xl font-semibold text-sm hover:opacity-95 transition-opacity shadow-md shadow-primary-container/20"
            >
              Get matched with helpers
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/browse-helpers"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-outline-variant bg-white rounded-xl font-semibold text-sm text-on-surface hover:bg-surface-container-lowest transition-colors"
            >
              Browse helpers
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-white band-hero">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-12">
          <section aria-labelledby="included-heading">
            <h2
              id="included-heading"
              className="font-display text-2xl font-bold text-on-surface mb-4"
            >
              What every {service.name.toLowerCase()} request includes
            </h2>
            <ul className="grid sm:grid-cols-2 gap-3">
              {INCLUDED.map((point) => (
                <li
                  key={point}
                  className="flex items-start gap-2.5 rounded-xl border border-outline-variant/50 bg-primary-fixed/30 p-4 text-on-surface-variant"
                >
                  <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  {point}
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="steps-heading">
            <h2 id="steps-heading" className="font-display text-2xl font-bold text-on-surface mb-4">
              How a {service.name.toLowerCase()} request works
            </h2>
            <ol className="grid sm:grid-cols-2 gap-4">
              {STEPS.map((step) => (
                <li
                  key={step.num}
                  className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-5"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary font-display text-sm font-bold text-on-primary">
                      {step.num}
                    </span>
                    <h3 className="font-display text-lg font-bold leading-snug text-on-surface">
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-on-surface-variant leading-relaxed">{step.desc}</p>
                </li>
              ))}
            </ol>
          </section>

          {guideHref && (
            <section aria-labelledby="guide-heading">
              <h2 id="guide-heading" className="font-display text-2xl font-bold text-on-surface mb-4">
                Free guide first
              </h2>
              <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-6">
                <h3 className="font-display text-xl font-bold text-on-surface mb-2">
                  {guide?.title ?? "Read the free guide"}
                </h3>
                <p className="text-on-surface-variant leading-relaxed mb-4">
                  {guide?.description ??
                    "Work through the process yourself with a step-by-step guide — structure, examples and checklists, free and no sign-up required."}
                </p>
                <Link
                  href={guideHref}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                >
                  Read the guide
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </section>
          )}

          <section aria-labelledby="related-heading">
            <h2 id="related-heading" className="font-display text-2xl font-bold text-on-surface mb-4">
              Other {service.group.title.toLowerCase()} services
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {siblings.map((item) => (
                <Link
                  key={item.slug}
                  href={`/services/${item.slug}`}
                  className="group rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-4 transition-all hover:border-primary-container/40 hover:shadow-md"
                >
                  <span className="font-semibold text-primary transition-colors">
                    {item.name}
                  </span>
                  <span className="mt-1 block text-on-surface-variant leading-relaxed">{item.desc}</span>
                </Link>
              ))}
            </div>
            <Link
              href="/subjects"
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
            >
              See every subject we cover
              <ArrowRight className="h-4 w-4" />
            </Link>
          </section>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-5">
            <h2 className="font-display text-lg font-bold text-on-surface mb-3">Related guides</h2>
            <ul className="space-y-2">
              {ALL_RESOURCES.filter((resource) => resource.category === "writing" || resource.category === "research")
                .slice(0, 5)
                .map((resource) => (
                  <li key={resource.slug}>
                    <Link
                      href={resourcePath(resource)}
                      className="text-primary transition-colors leading-snug"
                    >
                      {resource.title}
                    </Link>
                  </li>
                ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-outline-variant/50 bg-primary-fixed/50 p-5">
            <h2 className="font-display text-lg font-bold text-on-surface mb-2">About this category</h2>
            <p className="text-on-surface-variant leading-relaxed mb-4">{service.group.description}</p>
            <Link
              href={`/services#${service.group.id}`}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
            >
              All {service.group.title.toLowerCase()} services
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </aside>
      </div>
      </div>

      <CtaBand
        eyebrow="handshake"
        title={`Need ${service.name.toLowerCase()} from a verified helper?`}
        body="Pick the helper you want to work with, agree the scope and price in writing, and pay only after it looks right."
        primary={{
          label: "Browse Helpers",
          href: `/browse-helpers?subject=${encodeURIComponent(service.group.title)}`,
        }}
        secondary={{ label: "How It Works", href: "/how-it-works" }}
      />    </>
  );
}
