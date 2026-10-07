import Link from "next/link";
import { CtaBand, PAGE_TONES, PageHeader } from "@/components/marketing/page-shell";

const steps = [
  { num: "1", title: "Tell us what you need", desc: "Describe your assignment, select the subject, academic level, deadline, and any specific requirements. Upload files like rubrics, lecture notes, or drafts if you have them.", icon: "edit_note", details: ["Select subject and help type", "Describe your requirements", "Set your deadline", "Upload reference files"] },
  { num: "2", title: "Choose your helper", desc: "Browse verified peer helpers who specialize in your subject. Review profiles, ratings, and reviews, then pick the helper you feel most comfortable with — you're in control, not a random match.", icon: "group_add", details: ["Browse helpers by subject", "Review profiles and ratings", "Choose your preferred helper", "Start a conversation right away"] },
  { num: "3", title: "Review price & confirm", desc: "Receive a transparent, upfront quote with no hidden fees. Review the scope, timeline, and pricing before confirming. You only pay when you're satisfied with the match.", icon: "receipt_long", details: ["Transparent pricing", "No hidden fees", "Pay only after confirmation", "Secure payment processing"] },
  { num: "4", title: "Get completed work & learn", desc: "Receive your completed work on time. Review it, and if anything isn't right, request unlimited free revisions until you're fully satisfied — no extra cost, no time limit.", icon: "task_alt", details: ["On-time delivery", "Unlimited revisions until you're satisfied", "Learn from expert feedback"] },
];

export default function HowItWorksPage() {
  return (
    <>
      <PageHeader
        tone="green"
        icon="route"
        eyebrow="Simple Process"
        title="How It Works"
        subtitle="Get academic help in four simple steps — from description to delivery."
        crumbs={[{ label: "Home", href: "/" }, { label: "How It Works" }]}
      />

      <div className="band-soft">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-12">
          {steps.map((step, i) => {
            const tone = PAGE_TONES.blue;
            return (
            <div key={step.num} className="relative">
              {i < steps.length - 1 && (
                <div className="absolute left-6 top-14 bottom-0 w-px bg-gradient-to-b from-outline-variant via-outline-variant/40 to-transparent hidden sm:block" />
              )}
              <div className="flex gap-6">
                <div className={`w-12 h-12 ${tone.icon} ${tone.iconTile} rounded-full flex items-center justify-center font-display font-bold text-lg shrink-0 relative z-10 shadow-md`}>
                  {step.num}
                </div>
                <div className={`flex-1 bg-white rounded-2xl p-6 border ${tone.card} shadow-sm ${tone.cardHover} transition-all`}>
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`material-symbols-outlined ${tone.icon}`}>{step.icon}</span>
                    <h2 className="font-display text-xl font-bold text-on-surface">{step.title}</h2>
                  </div>
                  <p className="text-on-surface-variant leading-relaxed mb-4">{step.desc}</p>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {step.details.map((d) => (
                      <li key={d} className="flex items-center gap-2 text-base text-on-surface-variant leading-relaxed">
                        <span className={`material-symbols-outlined ${tone.text} text-sm`}>check_circle</span>
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

        <div className="mt-16 text-center bg-white rounded-2xl p-6 sm:p-10 border border-outline-variant/30 shadow-sm">
          <h2 className="font-display text-2xl font-bold text-on-surface mb-3">Ready to get started?</h2>
          <p className="text-on-surface-variant mb-6 max-w-lg mx-auto">Get matched with a verified helper in your subject and start improving your grades with Acadivo.</p>
          <Link href="/browse-helpers" className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary hover:bg-primary-container text-white rounded-xl font-semibold text-sm hover:opacity-95 transition-opacity shadow-md shadow-primary-container/30">
            Browse Helpers
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
