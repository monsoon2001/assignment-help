import Link from "next/link";
import { ChevronRight } from "lucide-react";

const sections = [
  { title: "1. Acceptance of Terms", content: "By accessing or using PeerCraft (\"the Platform\"), you agree to be bound by these Terms of Service. If you do not agree, please do not use our services. These terms apply to all users, including students seeking help and helpers providing guidance." },
  { title: "2. Description of Service", content: "PeerCraft is an academic peer guidance platform that connects students with verified peer helpers for tutoring, editing, and academic support. Our helpers provide guidance and feedback — they do not complete assignments on behalf of students. The Platform facilitates communication, payment processing, and quality assurance." },
  { title: "3. Academic Integrity", content: "PeerCraft is committed to academic integrity. Users must not use our services to submit work as their own without proper understanding. Helpers are required to guide and teach, not complete assignments. Violations of academic integrity policies may result in account suspension or termination." },
  { title: "4. User Accounts", content: "You must create an account to use PeerCraft. You are responsible for maintaining the confidentiality of your credentials and for all activity under your account. You must provide accurate and complete information during registration. We reserve the right to suspend accounts that violate our terms." },
  { title: "5. Helper Standards", content: "All helpers must pass our verification process, including credential verification and subject-matter testing. Helpers are expected to maintain high quality, respond promptly, and adhere to our academic integrity policies. Helpers who consistently receive poor ratings or violate our standards may be removed from the platform." },
  { title: "6. Payments & Pricing", content: "All pricing is transparent and communicated upfront before any work begins. Payments are processed securely through our platform. Users pay only after confirming a match with a helper. Prices are based on subject, complexity, deadline, and scope of work. All fees are clearly displayed before confirmation. All payments are final and non-refundable." },
  { title: "7. Revisions & Refunds", content: "Revisions are unlimited until you are fully satisfied with the delivered work, limited to the scope agreed at confirmation. New requirements beyond the original scope may warrant a new request. Because payments are final, no refunds are offered; disputes are mediated by the Academic Integrity Office in accordance with our Refund Policy." },
  { title: "8. Intellectual Property", content: "All content created on the Platform remains the intellectual property of the respective users. Helpers retain ownership of their guidance materials. Users may not redistribute, resell, or commercially exploit content obtained through PeerCraft without explicit permission." },
  { title: "9. Limitation of Liability", content: "PeerCraft provides academic guidance services on an \"as-is\" basis. We do not guarantee specific academic outcomes. Our liability is limited to the amount paid for the specific service in question. We are not responsible for academic decisions made by educational institutions." },
  { title: "10. Termination", content: "Either party may terminate the relationship at any time. PeerCraft reserves the right to suspend or terminate accounts for violations of these terms, academic integrity violations, or conduct that harms the community. Users may request account deletion through our support team." },
  { title: "11. Changes to Terms", content: "We may update these terms from time to time. Material changes will be communicated via email or through the Platform. Continued use of PeerCraft after changes constitutes acceptance of the updated terms." },
  { title: "12. Contact", content: "Questions about these Terms of Service should be directed to support@peercraft.com." },
];

export default function TermsPage() {
  return (
    <>
      <div className="bg-surface-container-high border-b border-outline-variant/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <nav className="flex items-center gap-2 text-sm text-on-surface-variant mb-4">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-on-surface font-medium">Terms of Service</span>
          </nav>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-on-surface mb-2">Terms of Service</h1>
          <p className="text-on-surface-variant">Last updated: September 10, 2026</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="prose-custom space-y-8">
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
