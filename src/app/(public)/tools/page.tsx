import type { Metadata } from "next";
import Link from "next/link";
import { CtaBand, PageHeader } from "@/components/marketing/page-shell";

export const metadata: Metadata = {
  title: "Free Study Tools for Students | Acadivo",
  description:
    "Free browser-based study tools: word counter, reading-time estimator, words-to-pages converter and more. No sign-up required.",
  alternates: { canonical: "/tools" },
};

const TOOLS = [
  { href: "/tools/word-counter", title: "Word Counter", desc: "Count words, characters, sentences and paragraphs instantly." },
];

export default function ToolsIndexPage() {
  return (
    <>
      <PageHeader
        title="Free Study Tools"
        subtitle="Quick, browser-based helpers for everyday academic tasks. No sign-up, no data stored."
        crumbs={[{ label: "Home", href: "/" }, { label: "Tools" }]}
      />
      <div className="band-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {TOOLS.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="group flex flex-col rounded-2xl border border-outline-variant/30 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
              >
                <h2 className="font-display text-lg font-bold text-on-surface mb-2">{tool.title}</h2>
                <p className="text-base text-on-surface-variant leading-relaxed flex-1">{tool.desc}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                  Open tool <span aria-hidden="true">→</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
      <CtaBand
        eyebrow="school"
        title="Need help with the assignment itself?"
        body="Tools handle the small stuff. For the writing, send your brief and a verified helper will quote your scope before you pay."
        primary={{ label: "Request Help", href: "/requests/new" }}
        secondary={{ label: "How It Works", href: "/how-it-works" }}
      />
    </>
  );
}
