"use client";

import { useState } from "react";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Select from "@/components/ui/select";
import Textarea from "@/components/ui/textarea";
import { MaterialIcon } from "@/lib/icons-map";

const SUBJECT_OPTIONS = [
  { value: "General Inquiry", label: "General Inquiry" },
  { value: "Need Help with an Assignment", label: "Need Help with an Assignment" },
  { value: "Become a Helper", label: "Become a Helper" },
  { value: "Technical Support", label: "Technical Support" },
  { value: "Billing Question", label: "Billing Question" },
  { value: "Feedback & Suggestions", label: "Feedback & Suggestions" },
];

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <Card className="p-6 sm:p-10 border border-outline-variant/50 shadow-md shadow-ink-900/5 text-center">
<div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <MaterialIcon name="check_circle" size={32} className="text-primary" />
          </div>
        <h2 className="font-display text-2xl font-bold text-on-surface mb-3">Message Sent!</h2>
        <p className="text-on-surface-variant mb-6">Thank you for reaching out. We&apos;ll get back to you within 24 hours.</p>
        <Button type="button" onClick={() => setSubmitted(false)}>
          Send Another Message
        </Button>
      </Card>
    );
  }

  return (
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
  );
}