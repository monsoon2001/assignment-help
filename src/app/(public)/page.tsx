import type { Metadata } from "next";
import Link from "next/link";
import { Star, CheckCircle, ArrowRight } from "lucide-react";
import PriceEstimateForm from "@/components/marketing/price-estimate-form";
import Avatar from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/server";
import { SERVICE_TYPES, SUBJECTS } from "@/lib/constants";

export const dynamic = "force-dynamic";

const SITE_URL = "https://acadibo.com";

const HERO_TITLE = "Assignment Help Online | Choose a Verified Assignment Helper | Acadibo";

const HERO_DESCRIPTION = `Get assignment help online from verified peer helpers across ${SUBJECTS.length} subjects. Post your brief, compare helpers by subject, rating and price, agree a personalized proposal, and pay only after you approve — essay help, lab reports, citations, programming, data analysis and more.`;

export const metadata: Metadata = {
  title: HERO_TITLE,
  description: HERO_DESCRIPTION,
  keywords: [
    "assignment help",
    "assignment helper",
    "homework help",
    "online assignment help",
    "essay help",
    "verified assignment helper",
    "tutoring",
    "proofreading and editing",
    "lab report help",
    "citation help",
  ],
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: HERO_TITLE,
    description: HERO_DESCRIPTION,
    url: SITE_URL,
    siteName: "Acadibo",
    type: "website",
  },
};

const services = [
  { icon: "edit_note", title: "Essay Writing", desc: "From brainstorming to final draft — structure, arguments, and citations guided step by step." },
  { icon: "summarize", title: "Report Writing", desc: "Research reports, lab reports, and case studies organized with clear methodology and analysis." },
  { icon: "assignment", title: "Homework Help", desc: "Stuck on a problem? Get step-by-step guidance to understand and complete your homework." },
  { icon: "route", title: "Project Guidance", desc: "Capstone projects, group assignments, and research papers — plan, execute, and present." },
  { icon: "school", title: "Tutoring & Concept Help", desc: "One-on-one concept explanations to build genuine understanding in any subject." },
  { icon: "rate_review", title: "Editing & Proofreading", desc: "Polish your work with expert feedback on grammar, clarity, tone, and formatting." },
];

const steps = [
  { num: "1", icon: "edit_note", title: "Tell us what you need", desc: "Describe your assignment, upload any files, and select the subject and deadline." },
  { num: "2", icon: "group_add", title: "Choose your helper", desc: "Pick the helper who specializes in your subject area and feel most comfortable with." },
  { num: "3", icon: "receipt_long", title: "Review price & confirm", desc: "Receive a transparent quote. No hidden fees — confirm only when you're satisfied." },
  { num: "4", icon: "task_alt", title: "Get completed work", desc: "Receive your completed work on time, with unlimited revisions until you're fully satisfied." },
];

const benefits = [
  { icon: "paid", title: "Clear Pricing", desc: "Know exactly what you'll pay upfront. No surprise charges, no hidden fees." },
  { icon: "chat", title: "Direct Communication", desc: "Message your helper directly. Ask questions, share files, and track progress." },
  { icon: "verified", title: "Quality You Can Trust", desc: "Every helper is vetted. Message them directly before you commit to anything." },
  { icon: "replay", title: "Unlimited Revisions", desc: "Not quite right? Request as many revisions as you need until you're fully satisfied — no extra cost, no deadlines." },
];

const subjects = ["English Literature", "Mathematics", "Biology", "Chemistry", "Physics", "Computer Science", "History", "Psychology", "Economics", "Business Studies", "Nursing", "Engineering", "Statistics", "Philosophy", "Sociology", "Political Science"];

const marqueeItems = SERVICE_TYPES;

const heroStats = [
  { value: `${SUBJECTS.length}`, label: "Subjects covered", icon: "category" },
  { value: `${SERVICE_TYPES.length}`, label: "Types of assignment help", icon: "handyman" },
  { value: "100%", label: "Quote before you pay", icon: "request_quote" },
  { value: "Unlimited", label: "Revisions on every job", icon: "replay" },
];

const heroHelpLinks = [
  { label: "Essay help", href: "/resources/writing/how-to-write-an-essay" },
  { label: "Lab report help", href: "/resources/research/how-to-write-a-lab-report" },
  { label: "MLA & APA citations", href: "/resources/citations/mla-citation-guide" },
  { label: "Programming help", href: "/services/programming-help" },
  { label: "Data analysis", href: "/resources/technical/how-to-analyze-data" },
  { label: "Thesis & dissertation", href: "/resources/projects/how-to-write-a-research-paper" },
  { label: "Proofreading & editing", href: "/resources/writing/how-to-proofread-an-essay" },
  { label: "Free study guides", href: "/resources" },
];

const heroSubjectLinks = [
  { label: "English Literature", href: "/subjects/english-literature" },
  { label: "Mathematics", href: "/subjects/mathematics" },
  { label: "Biology", href: "/subjects/biology" },
  { label: "Chemistry", href: "/subjects/chemistry" },
  { label: "Physics", href: "/subjects/physics" },
  { label: "Computer Science", href: "/subjects/computer-science" },
  { label: "Statistics", href: "/subjects/statistics" },
  { label: "Engineering", href: "/subjects/engineering" },
];

type HomeHelper = {
  id: string;
  name: string | null;
  avatar_url: string | null;
  rating_avg: number;
  subjects: string[];
  bio: string | null;
};

export default async function HomePage() {
  const supabase = await createClient();
  const { data: helpersData } = await supabase
    .from("users")
    .select("id, name, avatar_url, helper_profiles(rating_avg, bio, subjects)")
    .eq("role", "helper")
    .order("name", { ascending: true })
    .limit(6);

  const helpers: HomeHelper[] = (helpersData ?? []).map((u) => {
    const record = u as unknown as {
      id: string;
      name: string | null;
      avatar_url: string | null;
      helper_profiles:
        | { rating_avg: number; bio: string | null; subjects: string[] }[]
        | null;
    };
    const profile = record.helper_profiles?.[0];
    return {
      id: record.id,
      name: record.name,
      avatar_url: record.avatar_url,
      rating_avg: profile?.rating_avg ?? 0,
      subjects: profile?.subjects ?? [],
      bio: profile?.bio ?? null,
    };
  });

  return (
    <>
      {/* Trust Banner */}
      <div className="bg-surface-container-high border-b border-outline-variant/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-center gap-6 text-xs font-medium text-on-surface-variant flex-wrap">
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm text-primary">verified</span>
            Verified Mentors
          </span>
          <span className="hidden sm:inline text-outline-variant">|</span>
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm text-primary">verified_user</span>
            Human-to-Human Academic Support
          </span>
        </div>
      </div>

      {/* Services Marquee */}
      <div className="bg-primary overflow-hidden py-3.5 select-none">
        <div className="flex w-max animate-[marquee_38s_linear_infinite] hover:[animation-play-state:paused]">
          {[0, 1].map((dup) => (
            <div key={dup} className="flex items-center" aria-hidden={dup === 1}>
              {marqueeItems.map((item) => (
                <span
                  key={`${dup}-${item}`}
                  className="flex items-center whitespace-nowrap text-sm font-semibold uppercase tracking-wide text-on-primary"
                >
                  {item}
                  <span className="mx-6 h-1.5 w-1.5 rounded-full bg-on-primary/50 shrink-0" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-container/5 via-transparent to-secondary-container/5" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            {/* Left Column */}
            <div className="space-y-6">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-container/10 text-primary text-sm font-semibold">
                <span className="material-symbols-outlined text-sm">emoji_objects</span>
                Independent Peer Guidance
              </span>
              <h1 className="font-display text-4xl sm:text-5xl font-bold text-on-surface leading-tight">
                Find the Right Assignment Helper
              </h1>
              <p className="text-lg text-on-surface-variant leading-relaxed max-w-xl">
                Tell us what you&apos;re working on, browse relevant helpers, choose who you want to work with, discuss your requirements, and receive a personalized proposal before you pay.
              </p>

              {/* Trust Checkmarks */}
              <div className="flex flex-col sm:flex-row gap-4 text-sm text-on-surface-variant">
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                  Original support
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                  Verified subject experts
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                  Satisfaction guaranteed
                </span>
              </div>

              {/* Coverage Panel */}
              <div className="flex items-center gap-4 pt-2">
                <div className="flex -space-x-2">
                  {helpers.slice(0, 4).map((h) => (
                    <Avatar
                      key={h.id}
                      name={h.name ?? "Helper"}
                      src={h.avatar_url ?? undefined}
                      className="border-2 border-surface-container-lowest"
                    />
                  ))}
                </div>
                <div>
                  <p className="text-sm font-semibold text-on-surface">
                    Covering {SUBJECTS.length} subjects
                  </p>
                  <p className="text-xs text-on-surface-variant">
                    {SERVICE_TYPES.length} types of help, from essays to lab reports
                  </p>
                </div>
              </div>

              {/* Popular Help Types */}
              <div className="flex flex-wrap items-center gap-x-2 gap-y-2 text-sm">
                <span className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
                  Popular help
                </span>
                {heroHelpLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="px-2.5 py-1 rounded-full bg-surface-container-lowest border border-outline-variant/40 text-xs font-medium text-on-surface-variant hover:text-primary hover:border-primary-container transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              {/* Popular Subjects */}
              <div className="flex flex-wrap items-center gap-x-2 gap-y-2 text-sm">
                <span className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
                  By subject
                </span>
                {heroSubjectLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-xs font-medium text-primary/90 hover:text-primary hover:underline"
                  >
                    {link.label}
                  </Link>
                ))}
                <Link href="/subjects" className="text-xs font-semibold text-primary hover:underline">
                  All {SUBJECTS.length} subjects
                </Link>
              </div>

              {/* Stats */}
              <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                {heroStats.map((stat) => (
                  <div key={stat.label} className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-primary text-lg leading-none mt-0.5">
                      {stat.icon}
                    </span>
                    <div>
                      <dd className="font-display font-bold text-on-surface leading-tight">{stat.value}</dd>
                      <dt className="text-xs text-on-surface-variant leading-snug">{stat.label}</dt>
                    </div>
                  </div>
                ))}
              </dl>
            </div>

            {/* Right Column - Price Estimate Form */}
            <div className="bg-surface-container-lowest rounded-2xl shadow-lg border border-outline-variant/30 p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary-container/10 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary">calculate</span>
                </div>
                <div>
              <h2 className="font-display font-bold text-on-surface">Let&apos;s understand your assignment</h2>
              <p className="text-xs text-on-surface-variant">Share a few details to get started</p>
                </div>
              </div>
              <PriceEstimateForm />
            </div>
          </div>
        </div>
      </section>

      {/* Core Academic Services */}
      <section className="py-20 bg-surface-container-low">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary-container text-on-secondary-container text-xs font-semibold mb-4">
              <span className="material-symbols-outlined text-sm">auto_stories</span>
              Our Services
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-on-surface mb-4">Core Academic Services</h2>
            <p className="text-on-surface-variant max-w-2xl mx-auto">Comprehensive academic guidance across every stage of your coursework</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div key={service.title} className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30 hover:shadow-md hover:border-primary-container/30 transition-all group">
                <div className="w-12 h-12 bg-primary-container/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-container/20 transition-colors">
                  <span className="material-symbols-outlined text-primary">{service.icon}</span>
                </div>
                <h3 className="font-display font-bold text-on-surface mb-2">{service.title}</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">{service.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/services"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium border border-outline-variant rounded-xl text-on-surface hover:bg-surface-container-low transition-colors"
            >
              Explore All Services
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-container/10 text-primary text-xs font-semibold mb-4">
              <span className="material-symbols-outlined text-sm">route</span>
              Simple Process
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-on-surface mb-4">How It Works</h2>
            <p className="text-on-surface-variant max-w-2xl mx-auto">
              Get the academic help you need in four straightforward steps
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <div key={step.num} className="relative">
                {i < steps.length - 1 && (
                  <div
                    className="hidden lg:flex absolute top-1/2 -right-6 z-10 -translate-y-1/2 items-center gap-1"
                    aria-hidden="true"
                  >
                    <span className="w-8 h-px bg-gradient-to-r from-primary/40 to-tertiary/40" />
                    <ArrowRight className="w-4 h-4 text-primary" />
                    <span className="w-4 h-px bg-gradient-to-r from-tertiary/40 to-primary/40" />
                  </div>
                )}
                <div className="group h-full bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 text-center shadow-sm hover:shadow-xl hover:-translate-y-1.5 hover:border-primary-container/40 transition-all duration-300 relative overflow-hidden">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-primary-container to-secondary-container text-on-primary flex items-center justify-center mb-5 shadow-md shadow-primary-container/30 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined">{step.icon}</span>
                  </div>
                  <span className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 mb-3 rounded-full bg-surface-container-low text-on-surface-variant text-xs font-bold font-display">
                    Step {step.num}
                  </span>
                  <h3 className="font-display font-bold text-lg text-on-surface mb-2 group-hover:text-primary transition-colors">{step.title}</h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-14 text-center">
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary-container text-on-primary rounded-xl font-semibold text-sm hover:bg-primary transition-colors shadow-sm shadow-primary-container/40 group"
            >
              Start Your First Request
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <p className="text-xs text-on-surface-variant mt-3">
              No credit card required — create a free account in minutes.
            </p>
            <Link
              href="/how-it-works"
              className="inline-flex items-center gap-1.5 mt-4 text-sm font-semibold text-primary hover:underline"
            >
              See how it works in detail
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Meet The Helpers */}
      <section className="py-20 bg-surface-container-low">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-container/10 text-primary text-xs font-semibold mb-4">
              <span className="material-symbols-outlined text-sm">groups</span>
              Our Helpers
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-on-surface mb-4">Meet The Helpers</h2>
            <p className="text-on-surface-variant max-w-2xl mx-auto">Work with verified subject-matter experts who are passionate about helping you learn</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {helpers.map((helper) => (
              <div key={helper.id} className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4 mb-4">
                  <Avatar name={helper.name ?? "Helper"} src={helper.avatar_url ?? undefined} size="lg" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-display font-bold text-on-surface">{helper.name ?? "Helper"}</h3>
                      <span className="material-symbols-outlined text-primary text-sm">verified</span>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-semibold text-on-surface">
                        {helper.rating_avg > 0 ? helper.rating_avg.toFixed(1) : "New"}
                      </span>
                    </div>
                  </div>
                </div>
                {helper.bio && helper.bio.trim().length > 0 ? (
                  <p className="text-sm text-on-surface-variant mb-3 line-clamp-2">{helper.bio}</p>
                ) : (
                  <p className="text-sm text-on-surface-variant mb-3 line-clamp-2">
                    Subject helper ready to guide you through coursework and
                    assignments with clear, step-by-step support.
                  </p>
                )}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {helper.subjects.slice(0, 3).map((s) => (
                    <span key={s} className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-xs font-medium">{s}</span>
                  ))}
                </div>
                <div className="flex gap-3">
                  <Link href={`/helpers/${helper.id}`} className="flex-1 text-center px-4 py-2 text-sm font-medium border border-outline-variant rounded-xl text-on-surface hover:bg-surface-container-low transition-colors">
                    View Profile
                  </Link>
                  <Link href="/contact" className="flex-1 text-center px-4 py-2 text-sm font-medium bg-primary-container text-on-primary rounded-xl hover:bg-primary transition-colors">
                    Request Help
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/browse-helpers" className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium border border-outline-variant rounded-xl text-on-surface hover:bg-surface-container-low transition-colors">
              Browse All Helpers
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Why Students Choose Us */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-4">
              <span className="material-symbols-outlined text-sm">thumb_up</span>
              Why Acadibo
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-on-surface mb-4">Why Students Choose Us</h2>
            <p className="text-on-surface-variant max-w-2xl mx-auto">We&apos;re built for students, by people who understand the student experience</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {benefits.map((b) => (
              <div key={b.title} className="flex gap-4 bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30">
                <div className="w-12 h-12 bg-primary-container/10 rounded-xl flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary">{b.icon}</span>
                </div>
                <div>
                  <h3 className="font-display font-bold text-on-surface mb-1">{b.title}</h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Subjects We Cover */}
      <section className="py-20 bg-surface-container-low">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary-container text-on-secondary-container text-xs font-semibold mb-4">
              <span className="material-symbols-outlined text-sm">category</span>
              All Subjects
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-on-surface mb-4">Subjects We Cover</h2>
            <p className="text-on-surface-variant max-w-2xl mx-auto">From humanities to STEM, we have helpers across a wide range of disciplines</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {subjects.map((s) => (
              <Link
                key={s}
                href="/subjects"
                className="px-4 py-2 rounded-full bg-surface-container-lowest border border-outline-variant text-sm font-medium text-on-surface-variant hover:border-primary-container hover:text-primary hover:bg-primary-container/5 transition-all"
              >
                {s}
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/subjects" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
              View all subjects
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold mb-4">
              <span className="material-symbols-outlined text-sm">format_quote</span>
              Testimonials
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-on-surface mb-4">What Students Say</h2>
                <p className="text-on-surface-variant max-w-2xl mx-auto">
                  We&apos;re just getting started. Become one of our first students and help shape Acadibo.
                </p>
          </div>
          <div className="text-center py-10 text-on-surface-variant">
            <p>No testimonials yet — join us to be the first!</p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-surface-container-high">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-16 bg-primary-container rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-on-primary text-3xl">school</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-on-surface mb-4">
            Ready to get help with your next assignment?
          </h2>
          <p className="text-on-surface-variant mb-8 max-w-xl mx-auto leading-relaxed">
            Work one-on-one with verified peer experts across {SUBJECTS.length} subjects and build real understanding of your coursework.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/browse-helpers" className="px-8 py-3.5 bg-primary-container text-on-primary rounded-xl font-semibold text-sm hover:bg-primary transition-colors shadow-sm inline-flex items-center gap-2">
              Browse Helpers
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/how-it-works" className="px-8 py-3.5 border border-outline-variant rounded-xl font-semibold text-sm text-on-surface hover:bg-surface-container-low transition-colors">
              Learn How It Works
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
