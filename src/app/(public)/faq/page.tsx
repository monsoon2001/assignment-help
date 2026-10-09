import type { Metadata } from "next";
import { CtaBand, PageHeader } from "@/components/marketing/page-shell";
import FaqList from "@/components/marketing/faq-list";

const frequentlyAskedQuestions = [
  { q: "What is Acadivo?", a: "Acadivo is an academic peer guidance platform that connects students with verified subject-matter helpers. Our helpers provide tutoring, editing, and guidance to help you improve your writing and understand coursework concepts — they do not complete assignments on your behalf." },
  { q: "Is using Acadivo considered cheating?", a: "No. Acadivo operates as a tutoring and academic support platform. Our helpers provide guidance, explanations, and feedback to help you learn. Think of it like working with a tutor or visiting a writing center — you still do the work, but with expert guidance to improve your skills and understanding." },
  { q: "How are helpers verified?", a: "Every helper goes through a rigorous verification process including academic credential verification, subject-matter testing, sample work review, and an interview. We only accept helpers with strong academic records and demonstrated expertise in their subjects." },
  { q: "What subjects do you cover?", a: "We cover a wide range of subjects including English Literature, Mathematics, Biology, Chemistry, Physics, Computer Science, History, Psychology, Economics, Business Studies, Nursing, Engineering, Statistics, Philosophy, and more. If your subject isn't listed, contact us and we'll do our best to match you with a helper." },
  { q: "How does pricing work?", a: "Pricing is transparent and based on the type of help needed, subject complexity, deadline, and word count. You'll receive a clear quote before confirming any work — no hidden fees. You only pay after you confirm the match and are satisfied with the quoted price." },
  { q: "Can I request revisions?", a: "Yes! Revisions are unlimited until you're fully satisfied. If the completed work doesn't meet the agreed-upon requirements, you can request changes at no extra cost — as many times as you need. Entirely new requirements beyond the original scope may open a new request." },
  { q: "How do I choose a helper?", a: "After submitting a request, you'll see verified helpers who specialize in your subject area. You can review their profiles, ratings, and reviews, then choose the helper you feel most comfortable with. You can start a conversation right away to discuss scope before committing." },
  { q: "What payment methods do you accept?", a: "We accept all major credit cards, debit cards, and digital payment methods. All transactions are securely processed and your payment information is never shared with helpers." },
  { q: "What if I'm not satisfied with the work?", a: "Your satisfaction is our priority. Revisions are unlimited until you're fully satisfied — helpers are expected to keep revising until the work matches the agreed-upon scope. Payments are final — we don't offer refunds — so review the scope and price carefully before confirming. Disputes are mediated by the Academic Integrity Office." },
  { q: "Can I choose my own helper?", a: "Absolutely. You're in control — you browse verified helpers, review their profiles, ratings, and subject expertise, and choose the one who best fits your needs. Every request is directed to the helper you select." },
  { q: "How long does it take to get a proposal?", a: "After posting your request, available helpers can respond with proposals within minutes. Most students receive multiple quotes within an hour, depending on subject and deadline." },
  { q: "Do helpers write complete assignments?", a: "No. We provide tutoring and learning support: explanations, feedback, outlines, editing, citations and guidance. Our policy is clear — you learn, you write. We don't do your entire submission." },
  { q: "Is my information safe and private?", a: "Yes. We use encrypted connections, secure payments, and never share full assignment details beyond what's needed to quote. Files you upload stay private to the helper you choose." },
  { q: "What happens if a helper misses the deadline?", a: "The agreed timeline is part of your proposal. If timing slips, communicate in the workspace to adjust or request revisions. Your scope and deadlines are documented in writing before payment." },
  { q: "Can I work with the same helper again?", a: "Yes. Many students return to helpers they've worked well with. On your request, you can invite or pick the same helper when starting a new task." },
];

export const metadata: Metadata = {
  title: "FAQ | Acadivo",
  description: "Frequently asked questions about Acadivo tutoring, helper verification, pricing, revisions, and payments.",
};

export default function FAQPage() {
  return (
    <>
      <PageHeader
        title="Frequently Asked Questions"
        subtitle="Everything you need to know about Acadivo."
        crumbs={[{ label: "Home", href: "/" }, { label: "FAQ" }]}
      />

      <div className="band-hero">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <FaqList items={frequentlyAskedQuestions} />
      </div>
      </div>

      <CtaBand
        eyebrow="support_agent"
        title="Still have questions?"
        body="We're here to help. Reach out and we'll get back to you within 24 hours."
        primary={{ label: "Contact Us", href: "/contact" }}
        secondary={{ label: "Browse Helpers", href: "/browse-helpers" }}
      />
    </>
  );
}