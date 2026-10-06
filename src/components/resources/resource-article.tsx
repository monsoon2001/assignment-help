import Link from "next/link";
import { ChevronRight, Clock, ArrowRight, BookOpen } from "lucide-react";
import type { Resource, ResourceBlock } from "@/lib/resources/types";
import {
  CATEGORY_BY_SLUG,
  relatedResources,
  resourcePath,
  RESOURCE_BY_SLUG,
} from "@/lib/resources";

function slugify(heading: string): string {
  return heading
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// Several guides have a content section literally titled "Checklist" or
// "Common Mistakes", which would otherwise duplicate the ids of the fixed
// sections below — colliding React keys and two elements sharing one id, so
// the table of contents jumped to the wrong one.
function contentSectionIds(headings: string[]): string[] {
  const taken = new Set(["key-takeaways", "checklist", "common-mistakes", "related-guides"]);
  return headings.map((heading) => {
    const base = `s-${slugify(heading)}`;
    let id = base;
    let n = 2;
    while (taken.has(id)) id = `${base}-${n++}`;
    taken.add(id);
    return id;
  });
}

function BlockView({ block }: { block: ResourceBlock }) {
  switch (block.t) {
    case "p":
      return <p className="mb-5 text-on-surface-variant leading-[1.75]">{block.v}</p>;
    case "ul":
      return (
        <ul className="mb-6 space-y-2.5">
          {block.v.map((item) => (
            <li key={item} className="flex gap-3 text-on-surface-variant leading-relaxed">
              <span className="text-primary mt-2 w-1.5 h-1.5 rounded-full shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol className="mb-6 space-y-3">
          {block.v.map((item, i) => (
            <li key={item} className="flex gap-3 text-on-surface-variant leading-relaxed">
              <span className="text-primary font-semibold text-sm shrink-0 w-5">{i + 1}.</span>
              <span>{item}</span>
            </li>
          ))}
        </ol>
      );
    case "checklist":
      return (
        <ul className="mb-6 bg-surface-container-low rounded-xl p-5 space-y-2.5">
          {block.v.map((item) => (
            <li key={item} className="flex gap-3 text-on-surface-variant leading-relaxed">
              <span className="text-primary shrink-0 w-4">&#9744;</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );
    case "example":
      return (
        <div className="mb-6 border-l-2 border-primary bg-surface-container-lowest rounded-r-xl p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-3">{block.label}</p>
          <div className="space-y-2.5">
            {block.v.map((para) => (
              <p key={para} className="text-on-surface-variant leading-relaxed">
                {para}
              </p>
            ))}
          </div>
        </div>
      );
    case "note":
      return (
        <div className="mb-6 bg-primary-container/10 border border-primary-container/30 rounded-xl p-5">
          <p className="font-semibold text-on-surface mb-1.5">{block.title}</p>
          <p className="text-on-surface-variant leading-relaxed">{block.v}</p>
        </div>
      );
    case "table":
      return (
        <div className="mb-7 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                {block.head.map((h) => (
                  <th
                    key={h}
                    className="text-left font-semibold text-on-surface border-b-2 border-outline-variant px-3 py-2.5"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row) => (
                <tr key={row.join("|")} className="border-b border-outline-variant/40">
                  {row.map((cell) => (
                    <td key={cell} className="px-3 py-3 text-on-surface-variant align-top leading-relaxed">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
  }
}

function Checklist({ items, title }: { items: string[]; title: string }) {
  return (
    <section className="mb-10 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-6">
      <h2 className="font-display font-bold text-on-surface mb-4">{title}</h2>
      <ul className="space-y-2.5">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-on-surface-variant leading-relaxed">
            <span className="text-primary shrink-0 w-4">&#9744;</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function ResourceArticle({ resource }: { resource: Resource }) {
  const category = CATEGORY_BY_SLUG.get(resource.category);
  const path = resourcePath(resource);
  const related = relatedResources(resource);

  const contentIds = contentSectionIds(resource.sections.map((section) => section.heading));

  const toc = [
    ...resource.sections.map((s, i) => ({ label: s.heading, id: contentIds[i] })),
    { label: "Key Takeaways", id: "key-takeaways" },
    { label: "Checklist", id: "checklist" },
    { label: "Common Mistakes", id: "common-mistakes" },
    { label: "Related Guides", id: "related-guides" },
  ];

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://acadivo.com" },
      { "@type": "ListItem", position: 2, name: "Resources", item: "https://acadivo.com/resources" },
      {
        "@type": "ListItem",
        position: 3,
        name: category?.name ?? "Guides",
        item: `https://acadivo.com/resources/${resource.category}`,
      },
      { "@type": "ListItem", position: 4, name: resource.title, item: `https://acadivo.com${path}` },
    ],
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: resource.h1,
    description: resource.description,
    inLanguage: "en",
    proficiencyLevel: "Beginner",
    isAccessibleForFree: true,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />

      <div className="bg-surface-container-high border-b border-outline-variant/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-on-surface-variant mb-5">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/resources" className="hover:text-primary transition-colors">Resources</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="hover:text-primary transition-colors">
              {category ? (
                <Link href={`/resources/${resource.category}`}>{category.name}</Link>
              ) : (
                "Guides"
              )}
            </span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-on-surface font-medium truncate max-w-xs">{resource.title}</span>
          </nav>

          {category && (
            <Link
              href={`/resources/${resource.category}`}
              className="inline-flex items-center gap-1.5 bg-primary-container/20 text-primary rounded-full px-3 py-1 text-xs font-semibold mb-4 hover:bg-primary-container/30 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">{category.icon}</span>
              {category.name}
            </Link>
          )}

          <h1 className="font-display text-3xl sm:text-4xl font-bold text-on-surface mb-4 max-w-3xl">
            {resource.h1}
          </h1>

          <div className="flex items-center gap-2 text-sm text-on-surface-variant">
            <Clock className="w-4 h-4" />
            <span>{resource.readingMinutes} min read</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="lg:hidden mb-8">
          <details className="bg-surface-container-low rounded-xl p-4">
            <summary className="font-semibold text-on-surface cursor-pointer text-sm">On this page</summary>
            <ul className="mt-3 space-y-2">
              {toc.map((item) => (
                <li key={item.id}>
                  <a href={`#${item.id}`} className="text-sm text-on-surface-variant hover:text-primary block">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </details>
        </div>

        <div className="grid lg:grid-cols-[1fr_240px] gap-12">
          <article className="min-w-0">
            <div className="mb-8">
              {resource.intro.map((para) => (
                <p key={para} className="text-lg text-on-surface leading-[1.75] mb-4">
                  {para}
                </p>
              ))}
            </div>

            {resource.sections.map((section, i) => (
              <section key={contentIds[i]} className="mb-12">
                <h2
                  id={contentIds[i]}
                  className="font-display text-2xl font-bold text-on-surface mb-5 scroll-mt-24"
                >
                  {section.heading}
                </h2>
                {section.blocks.map((block, i) => (
                  <BlockView key={i} block={block} />
                ))}
                {section.links?.map((link) => {
                  const target = RESOURCE_BY_SLUG.get(link.slug);
                  if (!target) return null;
                  return (
                    <p key={link.slug} className="mt-4 text-sm text-on-surface-variant">
                      See also:{" "}
                      <Link href={resourcePath(target)} className="text-primary hover:underline font-medium">
                        {link.label}
                      </Link>
                    </p>
                  );
                })}
              </section>
            ))}

            <section id="key-takeaways" className="mb-12 scroll-mt-24">
              <h2 className="font-display text-2xl font-bold text-on-surface mb-5">Key Takeaways</h2>
              <ul className="space-y-3">
                {resource.takeaways.map((item) => (
                  <li key={item} className="flex gap-3 text-on-surface-variant leading-relaxed">
                    <span className="material-symbols-outlined text-primary shrink-0">check_circle</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section id="checklist" className="mb-12 scroll-mt-24">
              <Checklist items={resource.checklist} title="Checklist" />
            </section>

            <section id="common-mistakes" className="mb-12 scroll-mt-24">
              <h2 className="font-display text-2xl font-bold text-on-surface mb-5">Common Mistakes to Avoid</h2>
              <ul className="space-y-3">
                {resource.mistakes.map((item) => (
                  <li key={item} className="flex gap-3 text-on-surface-variant leading-relaxed">
                    <span className="material-symbols-outlined text-error shrink-0">error</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            {related.length > 0 && (
              <section id="related-guides" className="mb-12 scroll-mt-24">
                <h2 className="font-display text-2xl font-bold text-on-surface mb-5">Related Guides</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {related.map((item) => (
                    <Link
                      key={item.slug}
                      href={resourcePath(item)}
                      className="group bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-4 hover:border-primary-container/50 transition-colors"
                    >
                      <p className="font-semibold text-on-surface mb-1 group-hover:text-primary transition-colors">
                        {item.title}
                      </p>
                      <p className="text-sm text-on-surface-variant">{item.readingMinutes} min read</p>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {resource.subjects.length > 0 && (
              <section className="mb-12">
                <h2 className="font-display text-xl font-bold text-on-surface mb-4">Related Subjects</h2>
                <div className="flex flex-wrap gap-2">
                  {resource.subjects.map((subject) => (
                    <Link
                      key={subject.slug}
                      href={`/subjects/${subject.slug}`}
                      className="bg-surface-container-low rounded-full px-4 py-1.5 text-sm text-on-surface-variant hover:bg-surface-container-high transition-colors"
                    >
                      {subject.label}
                    </Link>
                  ))}
                </div>
              </section>
            )}

            <div className="bg-surface-container-high rounded-2xl p-6 sm:p-8 mb-12">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 bg-primary-container/20 rounded-xl flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="font-display text-xl font-bold text-on-surface mb-2">{resource.service.title}</h2>
                  <p className="text-on-surface-variant mb-5">{resource.service.body}</p>
                  <Link
                    href={resource.service.href}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-container text-on-primary rounded-xl font-semibold text-sm hover:bg-primary transition-colors"
                  >
                    {resource.service.cta}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>

            <div className="text-sm text-on-surface-variant border-t border-outline-variant/40 pt-6">
              <p>
                This guide is general academic guidance. Your instructor&apos;s requirements always take priority where
                they differ from anything written here.
              </p>
              <Link href="/resources" className="text-primary hover:underline mt-3 inline-block">
                Browse all student guides
              </Link>
            </div>
          </article>

          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <p className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant mb-4">On this page</p>
              <ul className="space-y-2 border-l-2 border-outline-variant/50 pl-4">
                {toc.map((item) => (
                  <li key={item.id}>
                    <a href={`#${item.id}`} className="text-sm text-on-surface-variant hover:text-primary block leading-snug">
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}