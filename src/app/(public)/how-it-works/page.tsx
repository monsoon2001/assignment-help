import Link from "next/link";
import { ChevronRight } from "lucide-react";

const steps = [
  { num: "1", title: "Tell us what you need", desc: "Describe your assignment, select the subject, academic level, deadline, and any specific requirements. Upload files like rubrics, lecture notes, or drafts if you have them.", icon: "edit_note", details: ["Select subject and help type", "Describe your requirements", "Set your deadline", "Upload reference files"] },
  { num: "2", title: "Choose your helper", desc: "Browse verified peer helpers who specialize in your subject. Review profiles, ratings, and reviews, then pick the helper you feel most comfortable with — you're in control, not a random match.", icon: "group_add", details: ["Browse helpers by subject", "Review profiles and ratings", "Choose your preferred helper", "Start a conversation right away"] },
  { num: "3", title: "Review price & confirm", desc: "Receive a transparent, upfront quote with no hidden fees. Review the scope, timeline, and pricing before confirming. You only pay when you're satisfied with the match.", icon: "receipt_long", details: ["Transparent pricing", "No hidden fees", "Pay only after confirmation", "Secure payment processing"] },
  { num: "4", title: "Get completed work & learn", desc: "Receive your completed work on time. Review it, and use up to 2 free revision rounds within 14 days of delivery to get it right. Payments are final — no refunds — so review scope and price before confirming.", icon: "task_alt", details: ["On-time delivery", "2 revision rounds within 14 days", "Payments are final — no refunds", "Learn from expert feedback"] },
];

export default function HowItWorksPage() {
  return (
    <>
      <div className="bg-surface-container-high border-b border-outline-variant/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <nav className="flex items-center gap-2 text-sm text-on-surface-variant mb-4">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-on-surface font-medium">How It Works</span>
          </nav>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-on-surface mb-2">How It Works</h1>
          <p className="text-on-surface-variant max-w-2xl">Get academic help in four simple steps — from description to delivery.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-12">
          {steps.map((step, i) => (
            <div key={step.num} className="relative">
              {i < steps.length - 1 && (
                <div className="absolute left-6 top-14 bottom-0 w-px bg-outline-variant/50 hidden sm:block" />
              )}
              <div className="flex gap-6">
                <div className="w-12 h-12 bg-primary-container text-on-primary rounded-full flex items-center justify-center font-display font-bold text-lg shrink-0 relative z-10">
                  {step.num}
                </div>
                <div className="flex-1 bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="material-symbols-outlined text-primary">{step.icon}</span>
                    <h2 className="font-display text-xl font-bold text-on-surface">{step.title}</h2>
                  </div>
                  <p className="text-on-surface-variant leading-relaxed mb-4">{step.desc}</p>
                  <ul className="grid grid-cols-2 gap-2">
                    {step.details.map((d) => (
                      <li key={d} className="flex items-center gap-2 text-sm text-on-surface-variant">
                        <span className="material-symbols-outlined text-emerald-500 text-sm">check_circle</span>
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center bg-surface-container-high rounded-2xl p-10">
          <h2 className="font-display text-2xl font-bold text-on-surface mb-3">Ready to get started?</h2>
          <p className="text-on-surface-variant mb-6 max-w-lg mx-auto">Join thousands of students who&apos;ve improved their grades with PeerCraft.</p>
          <Link href="/browse-helpers" className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary-container text-on-primary rounded-xl font-semibold text-sm hover:bg-primary transition-colors">
            Browse Helpers
          </Link>
        </div>
      </div>
    </>
  );
}
