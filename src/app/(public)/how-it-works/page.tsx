import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CtaBand, PAGE_TONES, PageHeader } from "@/components/marketing/page-shell";
import { MaterialIcon } from "@/lib/icons-map";

const steps = [
  { num: "1", title: "Tell us what you need", desc: "Describe your assignment, select the subject, academic level, deadline, and any specific requirements. Upload files like rubrics, lecture notes, or drafts if you have them.", icon: "edit_note", details: ["Select subject and help type", "Describe your requirements", "Set your deadline", "Upload reference files"] },
  { num: "2", title: "Get matched with a helper", desc: "Your brief goes straight to our verified academic helper, who reviews it and sends back a personalized proposal. Discuss the scope in the request chat — nothing starts without your approval.", icon: "group_add", details: ["Sent to our verified helper", "Discuss scope in the request chat", "Review the proposal", "Approve before any work starts"] },
  { num: "3", title: "Review price & confirm", desc: "Receive a transparent, upfront quote in Canadian dollars with no hidden fees. Review the scope, timeline, and price, then accept it to start the order.", icon: "receipt_long", details: ["Transparent pricing", "No hidden fees", "Pay only after accepting the quote", "Secure payment processing"] },
  { num: "4", title: "Get completed work & learn", desc: "Receive your completed work on time. Review it, and if anything isn't right, request unlimited free revisions until you're fully satisfied — no extra cost, no time limit.", icon: "task_alt", details: ["On-time delivery", "Unlimited revisions until you're satisfied", "Learn from expert feedback"] },
];

export default function HowItWorksPage() {
  return (
    <>
      <PageHeader
        title="How It Works"
        subtitle="Get academic help in four simple steps — from description to delivery."
        crumbs={[{ label: "Home", href: "/" }, { label: "How It Works" }]}
      />

      <div className="band-soft">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        <div className="space-y-12">
          {steps.map((step, i) => {
            const tone = PAGE_TONES.blue;
            return (
            <div key={step.num} className="relative">
              {i < steps.length - 1 && (
                <div className="absolute left-6 top-14 bottom-0 w-px bg-line hidden sm:block" />
              )}
              <div className="flex gap-6">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center font-display font-bold text-lg shrink-0 relative z-10 shadow-lg text-white bg-primary"
                >
                  {step.num}
                </div>
                <div className={`flex-1 bg-white rounded-2xl p-7 border ${tone.card} shadow-sm ${tone.cardHover} transition-all`}>
                  <div className="flex items-center gap-3 mb-3">
                    <MaterialIcon name={step.icon} size={24} className={tone.icon} />
                    <h2 className="font-display text-xl font-bold text-on-surface">{step.title}</h2>
                  </div>
                  <p className="text-on-surface-variant leading-relaxed mb-5">{step.desc}</p>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {step.details.map((d) => (
                      <li key={d} className="flex items-center gap-2.5 text-sm text-on-surface-variant">
                        <span className="w-5 h-5 rounded-full bg-primary-fixed flex items-center justify-center shrink-0">
                          <MaterialIcon name="check" size={13} className="text-primary" />
                        </span>
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            );
          })}
        </div>

        <div className="mt-16 text-center bg-white rounded-2xl p-8 sm:p-12 border border-primary-container/30 shadow-md shadow-primary-container/10 relative overflow-hidden">
          <span className="absolute inset-x-0 top-0 h-1 bg-primary" aria-hidden="true" />
          <h2 className="font-display text-3xl font-bold text-on-surface mb-3">Ready to get started?</h2>
          <p className="text-on-surface-variant mb-8 max-w-lg mx-auto leading-relaxed">Get matched with a verified helper in your subject and start improving your grades with Acadivo.</p>
          <Link href="/requests/new" className="inline-flex items-center gap-2 px-8 py-3.5 text-white rounded-xl font-semibold text-sm bg-primary hover:bg-primary-hover transition-colors shadow-lg shadow-primary/30">
            Request Help
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
      </div>

      <CtaBand
        eyebrow="tips_and_updates"
        title="Prefer to read first?"
        body="Every service page links to a free guide that walks through the same process, so you can learn the approach before you pay anyone."
        primary={{ label: "Browse Student Guides", href: "/resources" }}
        secondary={{ label: "Talk to Us", href: "/contact" }}
      />
    </>
  );
}
