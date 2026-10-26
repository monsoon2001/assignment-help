import type { Metadata } from "next";
import { PageHeader } from "@/components/marketing/page-shell";

export const metadata: Metadata = {
  title: "Terms of Service | Acadivo",
  description:
    "Acadivo's terms of service: academic integrity, accounts, secure local-currency payments, unlimited in-scope revisions, refunds, and limitation of liability.",
  alternates: { canonical: "/terms" },
};

const sections = [
  { title: "1. Acceptance of Terms", content: "By accessing or using Acadivo (\"the Platform\"), you agree to be bound by these Terms of Service. If you do not agree, please do not use our services. These terms apply to all users, including students seeking help and helpers providing guidance." },
  { title: "2. Description of Service", content: "Acadivo is an academic help platform that connects students with verified academic helpers for assignment support, tutoring, editing, research guidance, programming help, and other coursework services. Helpers work with you through the Platform's request chat and workspace to clarify your brief, provide the agreed deliverables, and respond to feedback. The Platform provides messaging, file delivery, progress tracking, revision requests, and secure payment processing — all communication, files, and payments must stay on Acadivo." },
  { title: "3. Academic Integrity", content: "Acadivo is committed to academic integrity and to supporting genuine learning. You agree to use the Platform and any delivered materials in accordance with your institution's policies and applicable law, and not to submit work you do not understand or present delivered materials as entirely your own where your institution prohibits it. Helpers must not assist with impersonation, examinations, or other prohibited conduct. Acadivo may refuse, cancel, or suspend requests that breach these standards." },
  { title: "4. User Accounts", content: "You must create an account to use Acadivo. You are responsible for maintaining the confidentiality of your credentials and for all activity under your account. You must provide accurate and complete information during registration. We reserve the right to suspend accounts that violate our terms." },
  { title: "5. Helper Standards", content: "All helpers must pass our verification process, including credential verification and subject-matter testing. Helpers are expected to maintain high quality, respond promptly, and adhere to our academic integrity and conduct policies. Helpers may not ask for or share personal contact details, arrange communication outside the Platform, or request payment outside Acadivo. Helpers who consistently receive poor ratings or violate our standards may be removed from the platform." },
  { title: "6. Payments & Pricing", content: "Helpers quote a price in a supported currency. At checkout, your total is shown and charged in your local currency where supported, with any conversion and processing costs included in that single total — there are no hidden fees or commissions added at checkout. Payment is taken at checkout after you accept a helper's quote, which confirms the order and the agreed scope. Prices are based on subject, complexity, deadline, length, and scope of work." },
  { title: "7. Revisions & Refunds", content: "Revisions are unlimited until the delivered files meet the agreed scope, and at no extra cost within that scope. New requirements beyond the original scope may warrant a new request. If the delivered files do not match the agreed scope, you may request a refund by contacting support within 14 days of delivery; refunds are reviewed and issued at Acadivo's discretion in accordance with our Refund Policy." },
  { title: "8. Intellectual Property", content: "All content created on the Platform remains the intellectual property of the respective users. Helpers retain ownership of their guidance and source materials. On full payment, you may use delivered files for your own personal academic purposes, but you may not redistribute, resell, publish, or commercially exploit content obtained through Acadivo without explicit permission." },
  { title: "9. Limitation of Liability", content: "Acadivo provides academic guidance services on an \"as-is\" basis. We do not guarantee specific academic outcomes. Our liability is limited to the amount paid for the specific service in question. We are not responsible for academic decisions made by educational institutions." },
  { title: "10. Termination", content: "Either party may terminate the relationship at any time. Acadivo reserves the right to suspend or terminate accounts for violations of these terms, academic integrity violations, or conduct that harms the community. Users may request account deletion through our support team." },
  { title: "11. Changes to Terms", content: "We may update these terms from time to time. Material changes will be communicated via email or through the Platform. Continued use of Acadivo after changes constitutes acceptance of the updated terms." },
  { title: "12. Contact", content: "Questions about these Terms of Service should be directed to support@acadivo.com." },
];

export default function TermsPage() {
  return (
    <>
      <PageHeader
        title="Terms of Service"
        subtitle="Last updated: October 25, 2026"
        crumbs={[{ label: "Home", href: "/" }, { label: "Terms of Service" }]}
      />

      <section className="band-soft">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="prose-custom space-y-6">
            {sections.map((section) => (
              <div key={section.title} className="bg-white rounded-2xl border border-outline-variant/30 p-6 shadow-sm hover:border-primary-container/40 transition-colors">
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
