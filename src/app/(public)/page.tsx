import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle, ArrowRight } from "lucide-react";
import { MaterialIcon } from "@/lib/icons-map";
import PriceEstimateForm from "@/components/marketing/price-estimate-form";
import AssistanceCta from "@/components/marketing/assistance-cta";
import TestimonialCarousel, { type Testimonial } from "@/components/marketing/testimonial-carousel";
import { createClient } from "@/lib/supabase/server";
import { SERVICE_TYPES, SUBJECTS } from "@/lib/constants";
import { SUBJECT_CONTENT } from "@/lib/subject-content";
import { RESOURCE_CATEGORIES, ALL_RESOURCES } from "@/lib/resources";
import {
  BENEFITS,
  HOMEPAGE_GUIDE_DETAIL,
  HOMEPAGE_SUBJECT_DETAIL,
  HOME_FAQS,
  HOME_SERVICE_COUNT,
  STEPS,
  TEAM_NOTE,
} from "@/lib/home-content";
import FaqAccordion from "@/components/marketing/faq-accordion";
import {
  accentForFeaturedGuide,
  accentForGuideCategory,
  accentForIndex,
  accentForStep,
  accentForSubject,
  DARK_LINK,
} from "@/lib/accent-styles";

export const dynamic = "force-dynamic";

const SITE_URL = "https://acadivo.com";

const HERO_TITLE = "Assignment Help Online from a Verified Assignment Helper | Acadivo";

const HERO_DESCRIPTION = `Get assignment help online from a verified subject helper across ${SUBJECTS.length} subjects. Send your brief, agree a personalized proposal, and pay only after you approve — essay help, lab reports, citations, programming, data analysis and more.`;

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
};

const marqueeItems = SERVICE_TYPES;

const services = [
  {
    icon: "edit_note",
    title: "Essay Writing",
    desc: "From brainstorming to final draft — structure, arguments, and citations guided step by step.",
    items: ["Thesis statements & arguments", "Outlines and paragraph structure", "Introductions and conclusions", "Argument and counter-argument"],
    guide: { label: "Essay guide", href: "/resources/writing/how-to-write-an-essay" },
  },
  {
    icon: "summarize",
    title: "Report Writing",
    desc: "Research reports, lab reports, and case studies organized with clear methodology and analysis.",
    items: ["Lab reports & method sections", "Case study analysis", "Findings and discussion", "Executive summaries"],
    guide: { label: "Report guide", href: "/resources/research/how-to-write-a-report" },
  },
  {
    icon: "assignment",
    title: "Homework Help",
    desc: "Stuck on a problem? Get step-by-step guidance to understand and complete your homework.",
    items: ["Problem sets worked through", "Concept explanations", "Past paper walkthroughs", "Check your working"],
    guide: { label: "Study guides", href: "/resources" },
  },
  {
    icon: "route",
    title: "Project Guidance",
    desc: "Capstone projects, group assignments, and research papers — plan, execute, and present.",
    items: ["Research proposals", "Literature reviews", "Project timelines", "Supervisor-ready drafts"],
    guide: { label: "Project guide", href: "/resources/projects/how-to-write-a-research-paper" },
  },
  {
    icon: "school",
    title: "Tutoring & Concept Help",
    desc: "One-on-one concept explanations to build genuine understanding in any subject.",
    items: ["Live concept sessions", "Exam preparation", "Weak-topic rebuilds", "Study plans"],
    guide: { label: "Academic writing", href: "/resources/writing/how-to-write-an-introduction" },
  },
  {
    icon: "rate_review",
    title: "Editing & Proofreading",
    desc: "Polish your work with expert feedback on grammar, clarity, tone, and formatting.",
    items: ["Grammar and punctuation", "Clarity and tone", "MLA, APA, Harvard & IEEE", "Referencing and citations"],
    guide: { label: "Citation guide", href: "/resources/citations/how-to-cite-sources" },
  },
];

// Shared default for process cards. Subject and service cards pick up their
// own accents from `accent-styles`.
// Nine subjects promoted on the homepage; every subject page stays reachable
// from /subjects.
const HOMEPAGE_SUBJECTS = [
  "english-literature",
  "chemistry",
  "statistics",
  "biology",
  "mathematics",
  "physics",
  "computer-science",
  "engineering",
  "academic-writing",
] as const;

export default async function HomePage() {
  const supabase = await createClient();
  const { data: reviewRows, error: reviewsError } = await supabase
    .from("helper_reviews")
    .select("id, rating, comment, created_at, student_name, student_avatar_url")
    .not("comment", "is", null)
    .order("created_at", { ascending: false })
    .limit(100);

  if (reviewsError) {
    console.error("Could not load public homepage reviews:", reviewsError.message);
  }

  const seenReviews = new Set<string>();
  const testimonials: Testimonial[] = ((reviewRows ?? []) as unknown as Array<{
    id: string;
    rating: number;
    comment: string | null;
    student_name: string | null;
    student_avatar_url: string | null;
    created_at: string | null;
  }>)
    .filter((review) => {
      const comment = review.comment?.trim() ?? "";
      if (comment.length < 40 || review.rating < 1 || review.rating > 5) return false;
      const key = `${(review.student_name ?? "").trim().toLowerCase()}|${comment.toLowerCase()}`;
      if (seenReviews.has(key)) return false;
      seenReviews.add(key);
      return true;
    })
    .slice(0, 6)
    .map((review) => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment!.trim(),
      studentName: review.student_name,
      studentAvatarUrl: review.student_avatar_url,
      createdAt: review.created_at,
    }));

  const averageRating =
    testimonials.length > 0
      ? testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length
      : 0;

  const homepageSubjects = HOMEPAGE_SUBJECTS.map((slug) => {
    const subject = SUBJECT_CONTENT.find((s) => s.slug === slug)!;
    return { ...subject, detail: HOMEPAGE_SUBJECT_DETAIL[slug] ?? "" };
  });

  // Six category cards plus three individual guides keeps the row at nine
  // entries while every description comes from the resource data itself.
  const homepageGuides = [
    ...RESOURCE_CATEGORIES.map((category) => ({
      key: `category-${category.slug}`,
      href: `/resources/${category.slug}`,
      icon: category.icon,
      title: category.name,
      description: category.description,
      detail: HOMEPAGE_GUIDE_DETAIL[category.slug] ?? "",
      meta: `${ALL_RESOURCES.filter((r) => r.category === category.slug).length} guides`,
      accent: accentForGuideCategory(category.slug),
    })),
    ...ALL_RESOURCES.filter((resource) => resource.featured)
      .slice(0, 3)
      .map((resource) => ({
        key: `guide-${resource.slug}`,
        href: `/resources/${resource.category}/${resource.slug}`,
        icon: "auto_stories",
        title: resource.title,
        description: resource.description,
        detail: "",
        meta: `${resource.readingMinutes} min read`,
        accent: accentForFeaturedGuide(resource.slug, resource.category),
      })),
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: HOME_FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const siteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Acadivo",
    url: SITE_URL,
    description: HERO_DESCRIPTION,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/requests/new?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <div className="home-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(siteSchema) }}
      />

      {/* Services Marquee */}
      <div className="bg-ink-900 overflow-hidden py-3 select-none">
        <div className="flex w-max animate-[marquee_38s_linear_infinite] hover:[animation-play-state:paused]">
          {[0, 1].map((dup) => (
            <div key={dup} className="flex items-center" aria-hidden={dup === 1}>
              {marqueeItems.map((item) => (
                <span
                  key={`${dup}-${item}`}
                  className="flex items-center whitespace-nowrap text-xs sm:text-sm font-semibold uppercase tracking-wide text-on-primary"
                >
                  {item}
                  <span className="mx-5 h-1.5 w-1.5 rounded-full bg-on-primary/50 shrink-0" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden band-hero">
        <div
          className="absolute inset-x-0 bottom-0 h-24 bg-section"
          aria-hidden="true"
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 lg:py-20">
          <div className="grid lg:grid-cols-[1fr_minmax(0,640px)] gap-8 lg:gap-10 items-start">
            {/* Left Column */}
            <div className="space-y-5 home-enter">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-fixed border border-outline-variant/50 text-primary text-xs sm:text-sm font-semibold">
                <MaterialIcon name="verified_user" size={16} />
                100% human help, never AI
              </span>
              <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-bold text-on-surface leading-tight">
                Get Help from a Verified{" "}
                <span className="text-primary">
                  Assignment Helper
                </span>
              </h1>
              <p className="text-base sm:text-lg text-on-surface-variant leading-relaxed max-w-xl">
                Tell us what you&apos;re working on — the subject, the deadline, the brief if you have it. A real
                helper in that subject reads it, comes back with a plan and a price in writing, and you decide
                from there. No bidding, no surprise invoice, and the work stays yours.
              </p>

              {/* Trust Checkmarks */}
              <div className="flex flex-col sm:flex-row gap-x-5 gap-y-2.5 text-sm text-on-surface-variant font-medium">
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary shrink-0" />
                  Verified subject helpers
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary shrink-0" />
                  Quote before you pay
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary shrink-0" />
                  Unlimited revisions in scope
                </span>
              </div>

              {/* Coverage Panel */}
              <div className="flex items-center gap-4 pt-1">
                <span className="w-11 h-11 rounded-xl bg-primary-fixed flex items-center justify-center shrink-0">
                  <MaterialIcon name="groups" size={22} className="text-primary" />
                </span>
                <div>
                  <p className="text-base font-semibold text-on-surface leading-relaxed">
                    {SUBJECTS.length} subjects, {HOME_SERVICE_COUNT} kinds of help
                  </p>
                  <p className="text-base text-on-surface-variant leading-relaxed">
                    from a literature essay to a lab report to a stubborn line of code
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column - Price Estimate Form */}
            <div
              id="estimate"
              className="hidden lg:block scroll-mt-24 bg-surface-container-lowest rounded-2xl shadow-2xl shadow-primary/10 ring-1 ring-outline-variant/70 border-2 border-outline-variant/70 p-6 sm:p-8 home-enter home-enter-delay"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-primary-fixed rounded-xl flex items-center justify-center shrink-0">
                  <MaterialIcon name="calculate" size={20} className="text-primary" />
                </div>
                <div>
                  <h2 className="estimate-heading font-display font-bold text-on-surface leading-tight">
                    Let&apos;s understand your assignment
                  </h2>
                  <p className="text-base text-on-surface-variant leading-relaxed">Share a few details to get started</p>
                </div>
              </div>
              <PriceEstimateForm />
            </div>
          </div>
        </div>
      </section>

      {/* Mobile: hero form is hidden, so open it in a sheet from here */}
      <div className="lg:hidden max-w-7xl mx-auto px-4 sm:px-6 py-5">
        <AssistanceCta />
      </div>

      {/* Core Academic Services */}
      <section className="py-12 sm:py-16 bg-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-8 sm:mb-10">
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-on-surface mb-3">
              What we can help with
            </h2>
            <p className="text-base sm:text-lg text-on-surface-variant leading-relaxed">
              Not a menu of fixed packages. Tell us the task and a helper in that subject will tell you
              whether they can help, and what it would involve.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-x-10">
            {services.map((service, index) => {
              const accent = accentForIndex(index);
              return (
              <div
                key={service.title}
                className="flex items-start gap-4 border-b border-outline-variant/50 py-5"
              >
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${accent.tile}`}>
                  <MaterialIcon name={service.icon} size={22} className={accent.icon} />
                </span>
                <div className="min-w-0">
                  <h3 className={`font-display text-lg font-bold ${accent.text}`}>{service.title}</h3>
                  <p className="mt-1 text-base text-on-surface-variant leading-relaxed">{service.desc}</p>
                  <Link
                    href={service.guide.href}
                    className={`mt-2 inline-flex items-center gap-1.5 text-sm font-semibold hover:underline ${DARK_LINK}`}
                  >
                    {service.guide.label}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
              );
            })}
          </div>

          <div className="mt-8">
            <Link
              href="/services"
              className={`inline-flex items-center gap-2 text-sm font-semibold hover:underline ${DARK_LINK}`}
            >
              See every type of help
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 sm:py-16 bg-white" aria-labelledby="how-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-8">
            <h2 id="how-heading" className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-on-surface mb-2">
              How getting help works
            </h2>
            <p className="text-base sm:text-lg text-on-surface-variant leading-relaxed">
              Four steps, and you stay in charge the whole way. Nothing starts until you have said yes to
              the plan.
            </p>
          </div>

          <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-5">
            {STEPS.map((step, i) => {
              const accent = accentForStep(i);
              return (
              <li key={step.num} className="relative group">
                {i < STEPS.length - 1 && (
                  <span
                    className={`hidden lg:block absolute top-6 left-[calc(50%+2.25rem)] right-[-1.25rem] h-px ${accent.hairline} opacity-20`}
                    aria-hidden="true"
                  />
                )}
                <span
                  className={`absolute -top-4 left-6 z-10 flex h-9 w-9 items-center justify-center rounded-full ${accent.tile} ${accent.text} font-display text-base font-bold shadow-md ring-4 ring-background transition-transform group-hover:scale-105`}
                  aria-hidden="true"
                >
                  {step.num}
                </span>
                <div
                  className={`h-full rounded-2xl border border-outline-variant/30 bg-white p-6 pt-7 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg ${accent.cardHover}`}
                >
                  <h3 className={`font-display text-lg font-bold leading-snug ${accent.text}`}>
                    {step.title}
                  </h3>
                  <p className="mt-2 text-base leading-relaxed text-on-surface-variant">{step.desc}</p>
                  <ul className="mt-4 space-y-1.5 border-t border-outline-variant/30 pt-4">
                    {step.points.map((point) => (
                      <li key={point} className="text-sm leading-snug text-on-surface-variant">
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
              );
            })}
          </ol>

          <div className="mt-8 grid sm:grid-cols-3 gap-4">
            {[
              { label: "Typical first response", value: "A few hours" },
              { label: "Payment timing", value: "Only after you approve a proposal" },
              { label: "Revisions", value: "Unlimited within the agreed scope" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between gap-3 bg-white rounded-xl border border-outline-variant/30 px-4 py-3 shadow-sm"
              >
                <span className="text-sm text-on-surface-variant">{item.label}</span>
                <span className="text-sm font-semibold text-on-surface text-right">{item.value}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 px-7 py-3 bg-primary hover:bg-primary-hover text-on-primary rounded-xl font-semibold text-sm hover:from-primary hover:to-primary transition-all shadow-md shadow-primary-container/30"
            >
              Start Your First Request
              <ArrowRight className="w-4 h-4" />
            </Link>
            <p className="text-base text-on-surface-variant mt-2.5 leading-relaxed">
              No credit card required — create a free account in minutes.
            </p>
          </div>
        </div>
      </section>

      {/* Why Students Choose Us */}
      <section className="py-12 sm:py-16 bg-white" aria-labelledby="why-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] gap-10 lg:gap-16">
            <div>
              <h2 id="why-heading" className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-on-surface mb-3">
                Why people use us
              </h2>
              <p className="text-base sm:text-lg text-on-surface-variant leading-relaxed">
                Most of what goes wrong with assignment help is boring: unclear scope, a price you didn&apos;t
                see coming, and work you can&apos;t account for. Here&apos;s what we do about each of those.
              </p>

              <div                             className="mt-7 rounded-2xl border border-outline-variant/40 bg-surface-container-low p-6">
                <h3 className="font-display text-lg font-bold text-on-surface mb-2">
                  {TEAM_NOTE.title}
                </h3>
                {TEAM_NOTE.paragraphs.map((paragraph, index) => (
                  <p
                    key={index}
                    className="mt-2 text-base text-on-surface-variant leading-relaxed"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            <ul className="grid sm:grid-cols-2 lg:grid-cols-1 gap-x-8">
              {BENEFITS.map((benefit, index) => {
                const accent = accentForIndex(index + 2);
                return (
                <li
                  key={benefit.title}
                  className={`border-b border-outline-variant/40 py-4 ${accent.cardHover}`}
                >
                  <h3 className={`font-display text-base font-bold ${accent.text}`}>{benefit.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-on-surface-variant">{benefit.desc}</p>
                </li>
                );
              })}
            </ul>
          </div>
        </div>
      </section>

      {/* Subjects We Cover */}
      <section className="py-12 sm:py-16 bg-section" aria-labelledby="subjects-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
            <div className="max-w-2xl">
              <h2
                id="subjects-heading"
                className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-on-surface mb-2"
              >
                Assignment help by subject
              </h2>
              <p className="text-base text-on-surface-variant leading-relaxed">
                Pick the field you&apos;re working in. Open a subject to see the topics covered and the kind
                of help available in it.
              </p>
            </div>
            <Link
              href="/subjects"
              className="inline-flex items-center gap-2 shrink-0 px-5 py-2.5 text-sm font-semibold border border-outline-variant/50 bg-white rounded-xl text-primary hover:bg-primary-fixed transition-colors"
            >
              View all subjects
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {homepageSubjects.map((s) => {
              const accent = accentForSubject(s.slug);
              return (
              <Link
                key={s.slug}
                href={`/subjects/${s.slug}`}
                className={`group flex flex-col bg-white rounded-2xl p-5 border border-outline-variant/30 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ${accent.cardHover}`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${accent.tile}`}>
                    <MaterialIcon name={s.icon} size={20} className={accent.icon} />
                  </span>
                  <h3 className={`font-display text-base font-bold transition-colors leading-snug ${accent.text}`}>
                    {s.name}
                  </h3>
                </div>
                <p className="text-base text-on-surface-variant leading-relaxed">{s.cardDesc}</p>
                {s.detail && (
                  <p className="hidden sm:block mt-2 text-base text-on-surface-variant/90 leading-relaxed">{s.detail}</p>
                )}
                <p className={`mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-semibold ${DARK_LINK}`}>
                  {s.name} help topics
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </p>
              </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Free Study Guides */}
      <section className="py-12 sm:py-16 bg-white" aria-labelledby="guides-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
            <div className="max-w-2xl">
              <h2
                id="guides-heading"
                className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-on-surface mb-2"
              >
                {ALL_RESOURCES.length} free guides before you pay for anything
              </h2>
              <p className="text-base text-on-surface-variant leading-relaxed">
                Every guide explains how to approach the task yourself — structure, examples and checklists.
                Read one first, then decide whether you still want a helper.
              </p>
            </div>
            <Link
              href="/resources"
              className="inline-flex items-center gap-2 shrink-0 px-5 py-2.5 text-sm font-semibold border border-outline-variant/50 bg-white rounded-xl text-primary hover:bg-primary-fixed transition-colors"
            >
              Browse all guides
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {homepageGuides.map((guide) => {
              return (
              <Link
                key={guide.key}
                href={guide.href}
                className={`group flex flex-col rounded-2xl border border-outline-variant/30 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${guide.accent.cardHover}`}
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${guide.accent.tile}`}>
                    <MaterialIcon name={guide.icon} size={20} className={guide.accent.icon} />
                  </span>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${guide.accent.tile} ${guide.accent.text}`}>
                    {guide.meta}
                  </span>
                </div>
                <h3 className={`font-display text-base font-bold leading-snug transition-colors ${guide.accent.text}`}>
                  {guide.title}
                </h3>
                <p className="mt-2 text-base leading-relaxed text-on-surface-variant">{guide.description}</p>
                {guide.detail && (
                  <p className="hidden sm:block mt-2 text-base leading-relaxed text-on-surface-variant/90">{guide.detail}</p>
                )}
                <span className={`mt-4 inline-flex items-center gap-1.5 text-sm font-semibold ${guide.accent.text}`}>
                  Read the guide
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section
        className="py-12 sm:py-16 bg-section"
        aria-labelledby="testimonials-heading"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-8">
            <h2
              id="testimonials-heading"
              className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-on-surface mb-2"
            >
              What students say
            </h2>
            <p className="text-base text-on-surface-variant leading-relaxed">
              {testimonials.length > 0 ? (
                <>
                  Feedback from students who chose to leave a review — rated{" "}
                  <span className="font-semibold text-on-surface">
                    {averageRating.toFixed(1)} / 5
                  </span>{" "}
                  on average.
                </>
              ) : (
                "We’re just getting started. Become one of our first students and help shape Acadivo."
              )}
            </p>
          </div>
          {testimonials.length > 0 ? (
            <TestimonialCarousel testimonials={testimonials} />
          ) : (
            <div className="text-center bg-surface-container-lowest rounded-2xl border border-outline-variant/30 py-10 px-6">
              <p className="text-base text-on-surface-variant leading-relaxed">
                No public reviews yet.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 sm:py-16 bg-white" aria-labelledby="faq-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-8">
            <h2 id="faq-heading" className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-on-surface mb-2">
              Assignment help questions, answered
            </h2>
            <p className="text-base text-on-surface-variant leading-relaxed">
              Quick answers on matching, pricing, revisions and academic integrity. There&apos;s more detail on
              the{" "}
              <Link href="/faq" className="text-primary font-semibold hover:underline">
                full FAQ page
              </Link>
              .
            </p>
          </div>

          <FaqAccordion items={HOME_FAQS} />
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden py-14 sm:py-20 band-ink" aria-labelledby="cta-heading">
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 bg-white/12 ring-1 ring-white/25">
              <MaterialIcon name="school" size={24} className="text-white/80" />
            </div>
            <h2
              id="cta-heading"
              className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3"
            >
              Ready to get help with your next assignment?
            </h2>
            <p className="on-band-muted mb-7 max-w-2xl mx-auto leading-relaxed text-base">
              Tell a helper in your subject what you&apos;re working on. You&apos;ll get the plan and the price
              in writing, and you only pay once it looks right.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/requests/new"
                className="px-7 py-3 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary-hover transition-colors shadow-lg shadow-primary/30 inline-flex items-center gap-2"
              >
                Request Help
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/sign-up"
                className="px-7 py-3 border border-white/35 rounded-xl font-semibold text-sm text-white hover:bg-white/10 transition-colors"
              >
                Create Free Account
              </Link>
            </div>
          </div>

          <div className="mt-10 pt-7 border-t border-white/15 grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-center">
            {[
              { label: "Read the process", href: "/how-it-works", note: "Four steps, no surprises" },
              { label: "Compare services", href: "/services", note: `${HOME_SERVICE_COUNT} help types` },
              { label: "Pick a subject", href: "/subjects", note: `${SUBJECTS.length} subject areas` },
              { label: "Ask a question", href: "/contact", note: "We reply within 24 hours" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group rounded-xl px-3 py-3 border border-white/10 hover:border-white/30 hover:bg-white/5 transition-colors"
              >
                <span className="block text-sm font-semibold text-white group-hover:text-white transition-colors">
                  {item.label}
                </span>
                <span className="block text-xs on-band-muted mt-0.5">{item.note}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
