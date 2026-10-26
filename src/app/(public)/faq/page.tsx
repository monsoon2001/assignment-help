import type { Metadata } from "next";
import { CtaBand, PageHeader } from "@/components/marketing/page-shell";
import FaqList from "@/components/marketing/faq-list";
import { faqJsonLd, jsonLdScript } from "@/lib/seo";

const frequentlyAskedQuestions = [
  { q: "What is Acadivo?", a: "Acadivo is an academic peer guidance platform that connects students with verified subject-matter helpers. Our helpers provide tutoring, editing, and guidance to help you improve your writing and understand coursework concepts — they do not complete assignments on your behalf." },
  { q: "Is using Acadivo considered cheating?", a: "No. Acadivo operates as a tutoring and academic support platform. Our helpers provide guidance, explanations, and feedback to help you learn. Think of it like working with a tutor or visiting a writing center — you still do the work, but with expert guidance to improve your skills and understanding." },
  { q: "How are helpers verified?", a: "Every helper is vetted before they can take a request. We review their academic background, check a work sample, and confirm the subjects they're qualified to support. If a helper doesn't keep that standard, we remove them from the platform." },
  { q: "What subjects do you cover?", a: "We cover a wide range of subjects including English Literature, Mathematics, Biology, Chemistry, Physics, Computer Science, History, Psychology, Economics, Business Studies, Nursing, Engineering, Statistics, Philosophy, and more. If your subject isn't listed, contact us and we'll do our best to match you with a helper." },
  { q: "How does pricing work?", a: "Pricing is transparent and based on the type of help needed, subject complexity, deadline, and word count. Everything is quoted in Canadian dollars (CAD) as a single total — no hidden fees. You only pay when you accept the helper's quote." },
  { q: "Can I request revisions?", a: "Yes! Revisions are unlimited until you're fully satisfied. If the completed work doesn't meet the agreed-upon requirements, you can request changes at no extra cost — as many times as you need. Entirely new requirements beyond the original scope may open a new request." },
  { q: "Who works on my request?", a: "Your request goes straight to our verified academic helper. They review your brief and respond with a personalized proposal, and you discuss the scope in the request chat before committing to anything." },
  { q: "What payment methods do you accept?", a: "We accept all major credit and debit cards. Payments are collected securely in Canadian dollars (CAD) and handled by Acadivo — your card details are never shared with helpers." },
  { q: "What if I'm not satisfied with the work?", a: "Your satisfaction is our priority. Revisions are unlimited until you're fully satisfied — helpers are expected to keep revising until the work matches the agreed-upon scope. If the delivered work doesn't match the agreed scope, you can request a refund by contacting support; refunds are reviewed case by case. Review the scope and price carefully before confirming." },
  { q: "How long does it take to get a proposal?", a: "Your helper reviews your brief and responds with a personalized proposal, usually within a few hours and often the same day, depending on the subject and deadline." },
  { q: "Do helpers write complete assignments?", a: "No. We provide tutoring and learning support: explanations, feedback, outlines, editing, citations and guidance. Our policy is clear — you learn, you write. We don't do your entire submission." },
  { q: "Is my information safe and private?", a: "Yes. We use encrypted connections, secure payments, and never share full assignment details beyond what's needed to quote. Files you upload stay private to your helper." },
  { q: "What happens if a helper misses the deadline?", a: "The agreed timeline is part of your proposal. If timing slips, communicate in the workspace to adjust or request revisions. Your scope and deadlines are documented in writing before payment." },
  { q: "Can I work with the same helper again?", a: "Yes. Many students return with follow-up work. Start a new request and the same verified helper will pick it up and quote the next task." },
];

export const metadata: Metadata = {
  title: "FAQ | Acadivo",
  description: "Frequently asked questions about Acadivo tutoring, helper verification, pricing, revisions, and payments.",
  alternates: { canonical: "/faq" },
};

export default function FaqPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(faqJsonLd(frequentlyAskedQuestions))}
      />
      <PageHeader
        title="Frequently Asked Questions"
        subtitle="Everything you need to know about Acadivo."
        crumbs={[{ label: "Home", href: "/" }, { label: "FAQ" }]}
      />

      <div className="band-hero">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        <FaqList items={frequentlyAskedQuestions} />
      </div>
      </div>

      <CtaBand
        eyebrow="support_agent"
        title="Still have questions?"
        body="We're here to help. Reach out and we'll get back to you within 24 hours."
        primary={{ label: "Contact Us", href: "/contact" }}
        secondary={{ label: "Request Help", href: "/requests/new" }}
      />
    </>
  );
}