"use client";

import { Mail, MapPin, Clock } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/marketing/page-shell";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Select from "@/components/ui/select";
import Textarea from "@/components/ui/textarea";

const SUBJECT_OPTIONS = [
  { value: "General Inquiry", label: "General Inquiry" },
  { value: "Need Help with an Assignment", label: "Need Help with an Assignment" },
  { value: "Become a Helper", label: "Become a Helper" },
  { value: "Technical Support", label: "Technical Support" },
  { value: "Billing Question", label: "Billing Question" },
  { value: "Feedback & Suggestions", label: "Feedback & Suggestions" },
];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <>
      <PageHeader
        tone="teal"
        icon="mail"
        eyebrow="Contact"
        title="Get In Touch"
        subtitle="Have a question, need help, or want to provide feedback? We'd love to hear from you."
        crumbs={[{ label: "Home", href: "/" }, { label: "Contact" }]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-5 gap-10 lg:gap-12">
          {/* Form */}
          <div className="lg:col-span-3">
            {submitted ? (
              <Card className="p-6 sm:p-10 border border-outline-variant/50 shadow-md shadow-ink-900/5 text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="material-symbols-outlined text-primary text-3xl">check_circle</span>
                </div>
                <h2 className="font-display text-2xl font-bold text-on-surface mb-3">Message Sent!</h2>
                <p className="text-on-surface-variant mb-6">Thank you for reaching out. We&apos;ll get back to you within 24 hours.</p>
                <Button type="button" onClick={() => setSubmitted(false)}>
                  Send Another Message
                </Button>
              </Card>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-md shadow-ink-900/5 space-y-5 p-6 sm:p-8">
                <h2 className="font-display text-xl font-bold text-on-surface">Send us a message</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input label="Full Name" type="text" required placeholder="Your name" />
                  <Input label="Email" type="email" required placeholder="your@email.com" />
                </div>
                <Select label="Subject" options={SUBJECT_OPTIONS} defaultValue={SUBJECT_OPTIONS[0].value} />
                <Textarea label="Message" rows={5} required placeholder="Tell us how we can help..." />
                <Button type="submit">
                  Send Message
                </Button>
              </form>
            )}
          </div>

          {/* Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 border border-outline-variant/30">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary-container/10 rounded-xl flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-on-surface mb-1">Email Us</h3>
                  <p className="text-base text-on-surface-variant leading-relaxed">support@acadivo.com</p>
                  <p className="text-xs text-on-surface-variant mt-1">We respond within 24 hours</p>
                </div>
              </div>
            </Card>
            <Card className="p-6 border border-outline-variant/30">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary-container/10 rounded-xl flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-on-surface mb-1">Support Hours</h3>
                  <p className="text-base text-on-surface-variant leading-relaxed">Monday - Friday: 9AM - 8PM EST</p>
                  <p className="text-xs text-on-surface-variant mt-1">Weekend support available via email</p>
                </div>
              </div>
            </Card>
            <Card className="p-6 border border-outline-variant/30">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary-container/10 rounded-xl flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-on-surface mb-1">Location</h3>
                  <p className="text-base text-on-surface-variant leading-relaxed">Acadivo HQ</p>
                  <p className="text-base text-on-surface-variant leading-relaxed">San Francisco, CA</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
