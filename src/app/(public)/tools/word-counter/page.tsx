import type { Metadata } from "next";
import { CtaBand, PageHeader } from "@/components/marketing/page-shell";
import WordCounter from "@/components/tools/word-counter";
import { jsonLdScript } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Word Counter – Count Words, Characters & Reading Time | Acadivo",
  description:
    "Free online word counter. Count words, characters, sentences, paragraphs and estimated reading time. Runs in your browser; your text is never stored.",
  alternates: { canonical: "/tools/word-counter" },
};

const webAppSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Word Counter",
  applicationCategory: "EducationalApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  url: "https://acadivo.com/tools/word-counter",
};

export default function WordCounterPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(webAppSchema)} />
      <PageHeader
        title="Word Counter"
        subtitle="Count words, characters, sentences and paragraphs, and estimate reading time. Everything runs in your browser."
        crumbs={[{ label: "Home", href: "/" }, { label: "Tools", href: "/tools" }, { label: "Word Counter" }]}
      />
      <div className="band-soft">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <WordCounter />
          <div className="mt-10 prose prose-sm max-w-none text-on-surface-variant">
            <h2 className="font-display text-xl font-bold text-on-surface">How to use</h2>
            <p>Paste or type your text above. Counts update instantly. Your text never leaves your browser.</p>
          </div>
        </div>
      </div>
      <CtaBand
        eyebrow="school"
        title="Need help writing the assignment?"
        body="Tools handle the small stuff. For the writing, send your brief and a verified helper will quote your scope before you pay."
        primary={{ label: "Request Help", href: "/requests/new" }}
        secondary={{ label: "How It Works", href: "/how-it-works" }}
      />
    </>
  );
}
