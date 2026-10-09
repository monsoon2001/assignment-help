import type { Metadata } from "next";
import { Mail, MapPin, Clock } from "lucide-react";
import { PageHeader } from "@/components/marketing/page-shell";
import ContactForm from "@/components/marketing/contact-form";

export const metadata: Metadata = {
  title: "Contact | Acadivo",
  description: "Have a question, need help, or want to provide feedback? Get in touch with the Acadivo team.",
};

export default function ContactPage() {
  return (
    <>
      <PageHeader
        title="Get In Touch"
        subtitle="Have a question, need help, or want to provide feedback? We'd love to hear from you."
        crumbs={[{ label: "Home", href: "/" }, { label: "Contact" }]}
      />

      <div className="band-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-5 gap-10 lg:gap-12">
          {/* Form */}
          <div className="lg:col-span-3">
            <ContactForm />
          </div>

          {/* Info */}
          <div className="lg:col-span-2 space-y-5">
            {[
              { icon: Mail, label: "Email Us", value: "support@acadivo.com", sub: "We respond within 24 hours" },
              { icon: Clock, label: "Support Hours", value: "Monday – Friday: 9AM – 8PM EST", sub: "Weekend support available via email" },
              { icon: MapPin, label: "Location", value: "Acadivo HQ", sub: "San Francisco, CA" },
            ].map(({ icon: Icon, label, value, sub }) => (
              <div key={label} className="relative overflow-hidden bg-white rounded-2xl p-6 border border-primary-container/25 shadow-sm hover:shadow-md transition-shadow">
                <span className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-primary-container to-primary-fixed" aria-hidden="true" />
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 bg-primary-fixed rounded-xl flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-on-surface mb-1">{label}</h3>
                    <p className="text-sm text-on-surface-variant leading-relaxed">{value}</p>
                    <p className="text-xs text-on-surface-variant/70 mt-1">{sub}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      </div>
    </>
  );
}