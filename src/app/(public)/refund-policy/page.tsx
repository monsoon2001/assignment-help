import Link from "next/link";
import { ChevronRight } from "lucide-react";

const sections = [
  { title: "Overview", content: "All payments on PeerCraft are final and non-refundable. When you confirm a price, you agree to pay for the helper's time and expertise, whether or not you use the completed work. Instead of refunds, every delivery includes up to 2 free revision rounds within 14 days of delivery." },
  { title: "Revisions", content: "Every delivery includes up to 2 free revision rounds within 14 days of delivery. Helpers are expected to address feedback that matches the original scope and requirements. Requesting a revision does not extend or reset the 14-day window." },
  { title: "Scope Changes", content: "Revisions are limited to the scope agreed upon at confirmation. Entirely new requirements beyond the original request may open a new request, with its own quote that you must approve before work begins." },
  { title: "Non-Refundable Items", content: "Because all payments are final, we do not offer refunds for completed work, partial work, completed tutoring sessions, or requests made more than 14 days after delivery." },
  { title: "Disputes", content: "If you believe your delivery did not match the agreed scope, or the helper became unresponsive within the delivery window, contact the Academic Integrity Office at support@peercraft.com within 14 days of delivery. Our team will review your case within 48 hours and respond with a decision." },
  { title: "No Chargebacks", content: "Please do not initiate a chargeback with your bank. Chargebacks are reviewed and may result in account suspension. Contact support first so we can resolve the issue through the revision process." },
  { title: "Contact", content: "For questions about this policy or to open a dispute, contact us at support@peercraft.com." },
];

export default function RefundPolicyPage() {
  return (
    <>
      <div className="bg-surface-container-high border-b border-outline-variant/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <nav className="flex items-center gap-2 text-sm text-on-surface-variant mb-4">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-on-surface font-medium">Refund Policy</span>
          </nav>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-on-surface mb-2">Refund Policy</h1>
          <p className="text-on-surface-variant">Last updated: September 10, 2026</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-8">
          {sections.map((s) => (
            <div key={s.title}>
              <h2 className="font-display text-lg font-bold text-on-surface mb-2">{s.title}</h2>
              <p className="text-sm text-on-surface-variant leading-relaxed">{s.content}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
