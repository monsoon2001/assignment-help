import Link from "next/link";
import { PageHeader } from "@/components/marketing/page-shell";

export type LegalSection = {
  title: string;
  content: string;
};

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function LegalPage({
  title,
  lastUpdated,
  summary,
  sections,
  crumbLabel,
}: {
  title: string;
  lastUpdated: string;
  summary: string;
  sections: LegalSection[];
  crumbLabel: string;
}) {
  const items = sections.map((s) => ({ ...s, id: slugify(s.title) }));

  return (
    <>
      <PageHeader
        title={title}
        subtitle={`Last updated: ${lastUpdated}`}
        crumbs={[{ label: "Home", href: "/" }, { label: crumbLabel }]}
      />

      <section className="band-soft">
        <div className="page-container py-10 sm:py-14">
          <div className="mx-auto max-w-[1100px] lg:grid lg:grid-cols-[220px_minmax(0,720px)] lg:justify-center lg:gap-10">
            {/* Mobile TOC */}
            <div className="mb-6 lg:hidden">
              <details className="rounded-xl border border-outline-variant/40 bg-white p-3 shadow-sm">
                <summary className="cursor-pointer list-none text-sm font-semibold text-on-surface">
                  On this page
                </summary>
                <nav aria-label="Table of contents" className="mt-3">
                  <ol className="space-y-1.5 text-sm">
                    {items.map((item, i) => (
                      <li key={item.id}>
                        <a
                          href={`#${item.id}`}
                          className="text-on-surface-variant hover:text-primary transition-colors"
                        >
                          {/^\d+\.\s+/.test(item.title) ? item.title : `${i + 1}. ${item.title}`}
                        </a>
                      </li>
                    ))}
                  </ol>
                </nav>
              </details>
            </div>

            {/* Desktop TOC */}
            <aside className="hidden lg:block">
              <nav
                aria-label="Table of contents"
                className="sticky top-24 rounded-xl border border-outline-variant/40 bg-white p-4 shadow-sm"
              >
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
                  On this page
                </p>
                <ol className="space-y-2 text-sm leading-snug">
                  {items.map((item, i) => {
                    const numbered = /^\d+\.\s+/.test(item.title);
                    return (
                      <li key={item.id}>
                        <a
                          href={`#${item.id}`}
                          className="block text-on-surface-variant hover:text-primary transition-colors"
                        >
                          {numbered ? item.title : `${i + 1}. ${item.title}`}
                        </a>
                      </li>
                    );
                  })}
                </ol>
              </nav>
            </aside>

            {/* Content */}
            <div id="top" className="mx-auto w-full max-w-[720px]">
              <div className="mb-8 rounded-2xl border border-primary/15 bg-primary/5 p-5 sm:p-6">
                <p className="text-sm font-semibold text-on-surface mb-1">Summary</p>
                <p className="text-[15px] leading-7 text-on-surface-variant">{summary}</p>
              </div>

              <div className="space-y-0">
                {items.map((item, i) => {
                  const numbered = /^\d+\.\s+/.test(item.title);
                  return (
                    <section
                      key={item.id}
                      id={item.id}
                      className="scroll-mt-28 border-t border-outline-variant/40 py-7 first:border-t-0 first:pt-0"
                    >
                      <h2 className="font-display text-xl font-bold text-on-surface mb-3 leading-snug">
                        {!numbered && <span className="mr-2 text-primary">{i + 1}.</span>}
                        {item.title}
                      </h2>
                      <p className="text-[16px] leading-[1.8] text-on-surface-variant">
                        {item.content}
                      </p>
                    </section>
                  );
                })}
              </div>

              <div className="mt-10 border-t border-outline-variant/40 pt-6">
                <a
                  href="#top"
                  className="inline-flex text-sm font-medium text-primary hover:underline"
                >
                  Back to top
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
