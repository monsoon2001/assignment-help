import { PageHeader } from "@/components/marketing/page-shell";

const sections = [
  { title: "Overview", content: "When you accept a helper's quote you pay for the helper's time and expertise, and work begins immediately, so payments are generally non-refundable. However, if the delivered work does not match the agreed scope, you can request a refund. In the meantime, revisions are unlimited — helpers keep revising until you are fully satisfied with the delivered work." },
  { title: "Revisions", content: "Revisions are unlimited until you are fully satisfied. Helpers are expected to address feedback that matches the original scope and requirements until the work meets the agreed-upon standard." },
  { title: "Scope Changes", content: "Revisions are limited to the scope agreed upon at confirmation. Entirely new requirements beyond the original request may open a new request, with its own quote that you must approve before work begins." },
  { title: "Refund Eligibility", content: "Refunds are reviewed case by case and are not automatic. We may decline a refund where the work was delivered within the agreed scope, for completed tutoring sessions, or where a request is made more than 14 days after delivery. Where a refund is approved, it is returned to your original payment method." },
  { title: "Disputes", content: "If you believe your delivery did not match the agreed scope, or the helper became unresponsive within the delivery window, contact the Academic Integrity Office at support@acadivo.com within 14 days of delivery. Our team will review your case within 48 hours and respond with a decision." },
  { title: "No Chargebacks", content: "Please do not initiate a chargeback with your bank. Chargebacks are reviewed and may result in account suspension. Contact support first so we can resolve the issue through the revision process." },
  { title: "Contact", content: "For questions about this policy or to open a dispute, contact us at support@acadivo.com." },
];

export default function RefundPolicyPage() {
  return (
    <>
      <PageHeader
        title="Refund Policy"
        subtitle="Last updated: September 10, 2026"
        crumbs={[{ label: "Home", href: "/" }, { label: "Refund Policy" }]}
      />


      <section className="band-soft">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="space-y-6">
            {sections.map((section) => (
              <div key={section.title} className="bg-white rounded-2xl border border-outline-variant/30 p-6 shadow-sm hover:border-primary-container/60 transition-colors">
                <h2 className="font-display text-lg font-bold text-on-surface mb-2">{section.title}</h2>
                <p className="text-base text-on-surface-variant leading-relaxed">{section.content}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
