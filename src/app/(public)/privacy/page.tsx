import Link from "next/link";
import { ChevronRight } from "lucide-react";

const sections = [
  { title: "1. Information We Collect", content: "We collect information you provide directly: name, email address, academic details, payment information, and communication content. We also collect usage data including device information, IP addresses, browsing patterns, and interaction data to improve our services." },
  { title: "2. How We Use Your Information", content: "We use your information to provide and improve our services, process payments, match students with helpers, communicate about your account and requests, ensure platform security, and comply with legal obligations. We do not sell your personal information to third parties." },
  { title: "3. Information Sharing", content: "We share information only as necessary to provide our services: with matched helpers (student name, assignment details), with payment processors (for transaction processing), and with legal authorities when required by law. We never sell your data to advertisers or data brokers." },
  { title: "4. Data Security", content: "We implement industry-standard security measures including encryption, secure servers, and regular security audits. While no method of transmission is 100% secure, we take reasonable steps to protect your personal information from unauthorized access, disclosure, or destruction." },
  { title: "5. Data Retention", content: "We retain your information for as long as your account is active or as needed to provide services. Account data is retained for 30 days after deletion request. Communication records are retained for 12 months for quality assurance. Anonymized data may be retained indefinitely for analytics." },
  { title: "6. Your Rights", content: "You have the right to access, correct, or delete your personal data. You may also request a copy of your data, opt out of non-essential communications, and withdraw consent for data processing. Contact support@peercraft.com to exercise these rights." },
  { title: "7. Cookies & Tracking", content: "We use essential cookies for platform functionality, analytics cookies to understand usage patterns, and preference cookies to remember your settings. You can manage cookie preferences through your browser settings. We do not use third-party advertising trackers." },
  { title: "8. Children's Privacy", content: "PeerCraft is not intended for users under 13. We do not knowingly collect information from children under 13. If we learn that we have collected such information, we will delete it promptly. Users under 18 must have parental consent to use our services." },
  { title: "9. International Users", content: "Your data may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for international data transfers, including standard contractual clauses and encryption during transfer." },
  { title: "10. Changes to This Policy", content: "We may update this Privacy Policy periodically. Material changes will be communicated via email or through the Platform. Your continued use of PeerCraft after changes constitutes acceptance of the updated policy." },
  { title: "11. Contact Us", content: "For questions about this Privacy Policy or to exercise your data rights, contact our privacy team at privacy@peercraft.com or support@peercraft.com." },
];

export default function PrivacyPage() {
  return (
    <>
      <div className="bg-surface-container-high border-b border-outline-variant/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <nav className="flex items-center gap-2 text-sm text-on-surface-variant mb-4">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-on-surface font-medium">Privacy Policy</span>
          </nav>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-on-surface mb-2">Privacy Policy</h1>
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
