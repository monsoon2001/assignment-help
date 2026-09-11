"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useState } from "react";

const faqs = [
  { q: "What is PeerCraft?", a: "PeerCraft is an academic peer guidance platform that connects students with verified subject-matter helpers. Our helpers provide tutoring, editing, and guidance to help you improve your writing and understand coursework concepts — they do not complete assignments on your behalf." },
  { q: "Is using PeerCraft considered cheating?", a: "No. PeerCraft operates as a tutoring and academic support platform. Our helpers provide guidance, explanations, and feedback to help you learn. Think of it like working with a tutor or visiting a writing center — you still do the work, but with expert guidance to improve your skills and understanding." },
  { q: "How are helpers verified?", a: "Every helper goes through a rigorous verification process including academic credential verification, subject-matter testing, sample work review, and an interview. We only accept helpers with strong academic records and demonstrated expertise in their subjects." },
  { q: "What subjects do you cover?", a: "We cover a wide range of subjects including English Literature, Mathematics, Biology, Chemistry, Physics, Computer Science, History, Psychology, Economics, Business Studies, Nursing, Engineering, Statistics, Philosophy, and more. If your subject isn't listed, contact us and we'll do our best to match you with a helper." },
  { q: "How does pricing work?", a: "Pricing is transparent and based on the type of help needed, subject complexity, deadline, and word count. You'll receive a clear quote before confirming any work — no hidden fees. You only pay after you confirm the match and are satisfied with the quoted price." },
  { q: "Can I request revisions?", a: "Yes! Every delivery includes up to 2 free revision rounds within 14 days of delivery. If the completed work doesn't meet the agreed-upon requirements, you can request a revision at no extra cost. Entirely new requirements beyond the original scope may open a new request." },
  { q: "How do I choose a helper?", a: "After submitting a request, you'll see verified helpers who specialize in your subject area. You can review their profiles, ratings, and reviews, then choose the helper you feel most comfortable with. You can start a conversation right away to discuss scope before committing." },
  { q: "What payment methods do you accept?", a: "We accept all major credit cards, debit cards, and digital payment methods. All transactions are securely processed and your payment information is never shared with helpers." },
  { q: "What if I'm not satisfied with the work?", a: "Your satisfaction is our priority. Every delivery includes up to 2 free revision rounds within 14 days of delivery, and helpers are expected to address scope-matching feedback. Payments are final — we don't offer refunds — so review the scope and price carefully before confirming. Disputes are mediated by the Academic Integrity Office." },
  { q: "Can I choose my own helper?", a: "Absolutely. You're in control — you browse verified helpers, review their profiles, ratings, and subject expertise, and choose the one who best fits your needs. Every request is directed to the helper you select." },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <>
      <div className="bg-surface-container-high border-b border-outline-variant/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <nav className="flex items-center gap-2 text-sm text-on-surface-variant mb-4">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-on-surface font-medium">FAQ</span>
          </nav>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-on-surface mb-2">Frequently Asked Questions</h1>
          <p className="text-on-surface-variant max-w-2xl">Everything you need to know about PeerCraft.</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left cursor-pointer hover:bg-surface-container-low/50 transition-colors"
              >
                <span className="font-semibold text-on-surface pr-4">{faq.q}</span>
                <span className={`material-symbols-outlined text-on-surface-variant shrink-0 transition-transform ${openIndex === i ? "rotate-180" : ""}`}>
                  expand_more
                </span>
              </button>
              {openIndex === i && (
                <div className="px-5 pb-5 text-sm text-on-surface-variant leading-relaxed border-t border-outline-variant/30 pt-4">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 text-center bg-surface-container-high rounded-2xl p-10">
          <h2 className="font-display text-xl font-bold text-on-surface mb-3">Still have questions?</h2>
          <p className="text-on-surface-variant mb-6">We&apos;re here to help. Reach out and we&apos;ll get back to you within 24 hours.</p>
          <Link href="/contact" className="inline-flex items-center gap-2 px-6 py-3 bg-primary-container text-on-primary rounded-xl font-semibold text-sm hover:bg-primary transition-colors">
            Contact Us
          </Link>
        </div>
      </div>
    </>
  );
}
