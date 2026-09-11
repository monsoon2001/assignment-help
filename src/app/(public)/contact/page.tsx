"use client";

import Link from "next/link";
import { ChevronRight, Mail, MapPin, Clock } from "lucide-react";
import { useState } from "react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <>
      <div className="bg-surface-container-high border-b border-outline-variant/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <nav className="flex items-center gap-2 text-sm text-on-surface-variant mb-4">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-on-surface font-medium">Contact</span>
          </nav>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-on-surface mb-2">Get In Touch</h1>
          <p className="text-on-surface-variant max-w-2xl">Have a question, need help, or want to provide feedback? We&apos;d love to hear from you.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-5 gap-12">
          {/* Form */}
          <div className="lg:col-span-3">
            {submitted ? (
              <div className="bg-surface-container-lowest rounded-2xl p-10 border border-outline-variant/30 text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="material-symbols-outlined text-emerald-600 text-3xl">check_circle</span>
                </div>
                <h2 className="font-display text-2xl font-bold text-on-surface mb-3">Message Sent!</h2>
                <p className="text-on-surface-variant mb-6">Thank you for reaching out. We&apos;ll get back to you within 24 hours.</p>
                <button onClick={() => setSubmitted(false)} className="px-6 py-2.5 bg-primary-container text-on-primary rounded-xl font-semibold text-sm hover:bg-primary transition-colors cursor-pointer">
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="bg-surface-container-lowest rounded-2xl p-8 border border-outline-variant/30 space-y-5">
                <h2 className="font-display text-xl font-bold text-on-surface">Send us a message</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-on-surface">Full Name</label>
                    <input type="text" required placeholder="Your name" className="w-full h-11 px-3.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-on-surface">Email</label>
                    <input type="email" required placeholder="your@email.com" className="w-full h-11 px-3.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all" />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-on-surface">Subject</label>
                  <select className="w-full h-11 px-3.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all appearance-none cursor-pointer">
                    <option>General Inquiry</option>
                    <option>Need Help with an Assignment</option>
                    <option>Become a Helper</option>
                    <option>Technical Support</option>
                    <option>Billing Question</option>
                    <option>Feedback & Suggestions</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-on-surface">Message</label>
                  <textarea rows={5} required placeholder="Tell us how we can help..." className="w-full p-3.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all resize-none" />
                </div>
                <button type="submit" className="px-6 py-3 bg-primary-container text-on-primary rounded-xl font-semibold text-sm hover:bg-primary transition-colors cursor-pointer">
                  Send Message
                </button>
              </form>
            )}
          </div>

          {/* Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary-container/10 rounded-xl flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-on-surface mb-1">Email Us</h3>
                  <p className="text-sm text-on-surface-variant">support@peercraft.com</p>
                  <p className="text-xs text-on-surface-variant mt-1">We respond within 24 hours</p>
                </div>
              </div>
            </div>
            <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary-container/10 rounded-xl flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-on-surface mb-1">Support Hours</h3>
                  <p className="text-sm text-on-surface-variant">Monday - Friday: 9AM - 8PM EST</p>
                  <p className="text-xs text-on-surface-variant mt-1">Weekend support available via email</p>
                </div>
              </div>
            </div>
            <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary-container/10 rounded-xl flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-on-surface mb-1">Location</h3>
                  <p className="text-sm text-on-surface-variant">PeerCraft HQ</p>
                  <p className="text-sm text-on-surface-variant">San Francisco, CA</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
