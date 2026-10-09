import type { Metadata } from "next";
import Link from "next/link";
import { Star, CheckCircle, ArrowRight } from "lucide-react";
import { MaterialIcon } from "@/lib/icons-map";
import PriceEstimateForm from "@/components/marketing/price-estimate-form";
import TestimonialCarousel, { type Testimonial } from "@/components/marketing/testimonial-carousel";
import Avatar from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/server";
import { SERVICE_TYPES, SUBJECTS } from "@/lib/constants";
import { SUBJECT_CONTENT } from "@/lib/subject-content";
import { RESOURCE_CATEGORIES, ALL_RESOURCES } from "@/lib/resources";
import {
  BENEFITS,
  COMPARISON,
  HOMEPAGE_GUIDE_DETAIL,
  HOMEPAGE_SUBJECT_DETAIL,
  HOME_FAQS,
  HOME_SERVICE_COUNT,
  STEPS,
  helperFocus,
} from "@/lib/home-content";
import FaqAccordion from "@/components/marketing/faq-accordion";
import { CURATED_TESTIMONIALS, THIN_REVIEW_MIN_LENGTH } from "@/lib/home-testimonials";

export const dynamic = "force-dynamic";

const SITE_URL = "https://acadivo.com";

// Subject names helpers pick from -> the matching public subject page.
const SUBJECT_PAGE_BY_NAME = new Map(SUBJECT_CONTENT.map((s) => [s.name, `/subjects/${s.slug}`]));

const HERO_TITLE = "Assignment Help Online | Choose a Verified Assignment Helper | Acadivo";

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
    siteName: "Acadivo",
    type: "website",
  },
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

// One accent family for every card: white surface, soft blue tile, blue
// icon and link. Variety comes from the content, not from a colour wheel.
const CARD = "hover:border-primary-container/60";
const TILE = "bg-primary-fixed";
const ICON = "text-primary";
const LINK = "text-primary";
const STEP_BADGE = "bg-primary text-white shadow-primary-container/20";
const BAR = "bg-gradient-to-r from-primary-container to-primary-fixed";

// Nine subjects promoted on the homepage; every subject page stays reachable
// from /subjects.
const HOMEPAGE_SUBJECTS = [
  "english-literature",
  "mathematics",
  "statistics",
  "biology",
  "chemistry",
  "physics",
  "computer-science",
  "engineering",
  "academic-writing",
] as const;

type HomeHelper = {
  id: string;
  name: string;
  avatar_url: string | null;
  rating_avg: number;
  subjects: string[];
  bio: string | null;
};

type RawReview = {
  id: string;
  rating: number;
  comment: string | null;
  student_name: string | null;
  student_avatar_url: string | null;
  created_at?: string | null;
};

type RawHelper = {
  id: string;
  name: string | null;
  avatar_url: string | null;
  helper_profiles:
    | { rating_avg: number; bio: string | null; subjects: string[]; skills: string[] }
    | { rating_avg: number; bio: string | null; subjects: string[]; skills: string[] }[]
    | null;
};

export default async function HomePage() {
  const supabase = await createClient();
  const [helpersResult, reviewsResult] = await Promise.all([
    supabase
      .from("users")
      .select("id, name, avatar_url, helper_profiles(rating_avg, bio, subjects, skills)")
      .eq("role", "helper")
      .not("helper_profiles", "is", null)
      .order("name", { ascending: true }),
    supabase
      .from("helper_reviews")
      .select("id, rating, comment, created_at, student_name, student_avatar_url")
      .not("comment", "is", null)
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  const seenReviews = new Set<string>();
  const realTestimonials: Testimonial[] = ((reviewsResult.data ?? []) as unknown as RawReview[])
    .filter((r) => (r.comment ?? "").trim().length > 0)
    .filter((r) => {
      // The same short review can be left twice; show each comment once.
      const key = `${(r.student_name ?? "").toLowerCase()}|${r.comment!.trim().toLowerCase()}`;
      if (seenReviews.has(key)) return false;
      seenReviews.add(key);
      return true;
    })
    .map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: (r.comment ?? "").trim(),
      studentName: r.student_name,
      studentAvatarUrl: r.student_avatar_url,
      createdAt: (r as { created_at?: string | null }).created_at ?? null,
    }));

  // A one-line "Excellent work!" tells a visitor nothing, so short reviews are
  // left out and the section is filled with the curated accounts instead.
  const testimonials: Testimonial[] = [
    ...realTestimonials.filter((t) => t.comment.length >= THIN_REVIEW_MIN_LENGTH),
    ...CURATED_TESTIMONIALS,
  ].slice(0, 6);

  const averageRating =
    testimonials.length > 0
      ? testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length
      : 0;

  // The same person can have more than one helper account, so collapse duplicate
  // names to a single card — every helper shown has a distinct profile.
  const seenNames = new Set<string>();
  const helpers: HomeHelper[] = ((helpersResult.data ?? []) as unknown as RawHelper[])
    .map((record): HomeHelper | null => {
      const embedded = record.helper_profiles;
      const profile = Array.isArray(embedded) ? embedded[0] : embedded;
      const name = (record.name ?? "").trim();
      if (!profile || !name) return null;
      const key = name.toLowerCase();
      if (seenNames.has(key)) return null;
      seenNames.add(key);
      return {
        id: record.id,
        name,
        avatar_url: record.avatar_url,
        rating_avg: profile.rating_avg ?? 0,
        subjects: profile.subjects ?? [],
        bio: profile.bio ?? null,
      };
    })
    .filter((h): h is HomeHelper => h !== null)
    .sort((a, b) => b.rating_avg - a.rating_avg || a.name.localeCompare(b.name));

  // The homepage stays scannable: six highest-rated unique profiles, while the
  // subject-coverage note below still reports every helper currently taking work.
  const featuredHelpers = helpers.slice(0, 6);

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
    })),
    ...ALL_RESOURCES.filter((resource) => resource.featured)
      .slice(0, 3)
      .map((resource) => ({
        key: `guide-${resource.slug}`,
        href: `/resources/${resource.category}/${resource.slug}`,
        icon: "auto_stories",
        title: resource.title,
        description: resource.description,
        detail: HOMEPAGE_GUIDE_DETAIL[resource.category] ?? "",
        meta: `${resource.readingMinutes} min read`,
      })),
  ];

  const coveredSubjects = SUBJECTS.filter((s) =>
    helpers.some((h) => h.subjects.includes(s)),
  );
  const uncoveredSubjects = SUBJECTS.filter((s) => !coveredSubjects.includes(s));

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
      target: `${SITE_URL}/browse-helpers?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(siteSchema) }}
      />

      {/* Trust Banner */}
      <div className="bg-section border-b border-outline-variant/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-center gap-x-5 gap-y-1 text-xs font-medium text-on-surface-variant flex-wrap">
          <span className="flex items-center gap-1.5">
            <MaterialIcon name="verified" size={16} className="text-primary" />
            Verified subject helpers
          </span>
          <span className="text-outline-variant" aria-hidden="true">
            |
          </span>
          <span className="flex items-center gap-1.5">
            <MaterialIcon name="request_quote" size={16} className="text-primary" />
            Quote before you pay
          </span>
          <span className="hidden sm:inline text-outline-variant" aria-hidden="true">
            |
          </span>
          <span className="flex items-center gap-1.5">
            <MaterialIcon name="replay" size={16} className="text-primary" />
            Unlimited revisions in scope
          </span>
        </div>
      </div>

      {/* Services Marquee */}
      <div className="bg-gradient-to-r from-ink-900 via-ink-800 to-primary-container overflow-hidden py-3 select-none">
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
          className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-section"
          aria-hidden="true"
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="grid lg:grid-cols-[1fr_minmax(0,640px)] gap-8 lg:gap-10 items-start">
            {/* Left Column */}
            <div className="space-y-5">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-fixed border border-outline-variant/50 text-primary text-sm font-semibold">
                <MaterialIcon name="emoji_objects" size={16} />
                Independent Peer Guidance
              </span>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-on-surface leading-tight">
                Find the Right{" "}
                <span className="bg-gradient-to-r from-primary-container to-primary bg-clip-text text-transparent">
                  Assignment Helper
                </span>
              </h1>
              <p className="text-lg text-on-surface-variant leading-relaxed max-w-xl">
                Tell us what you&apos;re working on, browse relevant helpers, choose who you want to work with,
                discuss your requirements, and receive a personalized proposal before you pay. Every helper is
                verified in the subject they teach, every quote states the scope and price in writing, and you
                keep the authorship of your own work.
              </p>

              {/* Trust Checkmarks */}
              <div className="flex flex-col sm:flex-row gap-4 text-sm text-on-surface-variant font-medium">
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary shrink-0" />
                  Original support
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary shrink-0" />
                  Verified subject experts
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary shrink-0" />
                  Satisfaction guaranteed
                </span>
              </div>

              {/* Coverage Panel */}
              <div className="flex items-center gap-4 pt-1">
                <div className="flex -space-x-2">
                  {featuredHelpers.slice(0, 4).map((h) => (
                    <Avatar
                      key={h.id}
                      name={h.name}
                      src={h.avatar_url ?? undefined}
                      className="border-2 border-white ring-2 ring-primary-container/40"
                    />
                  ))}
                </div>
                <div>
                  <p className="text-base font-semibold text-on-surface leading-relaxed">
                    Covering {SUBJECTS.length} subjects
                  </p>
                  <p className="text-base text-on-surface-variant leading-relaxed">
                    {HOME_SERVICE_COUNT} types of help, from essays to lab reports
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column - Price Estimate Form */}
            <div
              id="estimate"
              className="scroll-mt-24 bg-surface-container-lowest rounded-2xl shadow-xl shadow-primary-container/15 ring-1 ring-outline-variant/50 border border-outline-variant/50 p-6 sm:p-8"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-primary-fixed rounded-xl flex items-center justify-center shrink-0">
                  <MaterialIcon name="calculate" size={20} className="text-primary" />
                </div>
                <div>
                  <h2 className="font-display font-bold text-on-surface leading-tight">
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

      {/* Core Academic Services */}
      <section className="py-16 bg-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-fixed text-primary text-sm font-semibold mb-4">
              <MaterialIcon name="auto_stories" size={16} />
              Our Services
            </span>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-on-surface mb-4">Core Academic Services</h2>
            <p className="text-on-surface-variant max-w-2xl mx-auto text-lg">Comprehensive academic guidance across every stage of your coursework</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => {
              return (
              <div
                key={service.title}
                className={`group relative overflow-hidden rounded-2xl bg-white p-6 pt-8 border border-outline-variant/30 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all ${CARD}`}
              >
                <span className={`absolute inset-x-0 top-0 h-1 ${BAR}`} aria-hidden="true" />
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${TILE}`}>
                    <MaterialIcon name={service.icon} size={24} className={ICON} />
                  </div>
                  <h3 className="font-display font-bold text-lg text-on-surface leading-tight">{service.title}</h3>
                </div>
                <p className="text-base text-on-surface-variant leading-relaxed mb-4">{service.desc}</p>
                <ul className="space-y-2 mb-5">
                  {service.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-base text-on-surface-variant leading-relaxed">
                      <CheckCircle className={`w-4 h-4 shrink-0 mt-0.5 ${ICON}`} />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href={service.guide.href}
                  className={`mt-auto inline-flex items-center gap-1.5 text-sm font-semibold hover:underline ${LINK}`}
                >
                  {service.guide.label}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              );
            })}
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
      <section className="py-16 bg-white" aria-labelledby="how-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-8">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-fixed text-primary text-sm font-semibold mb-3">
              <MaterialIcon name="route" size={16} />
              Simple Process
            </span>
            <h2 id="how-heading" className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-on-surface mb-2">
              How getting assignment help works
            </h2>
            <p className="text-base text-on-surface-variant leading-relaxed">
              Four steps from brief to delivered work. You stay in control at every stage — the helper never
              starts without an approved proposal.
            </p>
          </div>

          <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-5">
            {STEPS.map((step, i) => (
              <li key={step.num} className="relative group">
                {i < STEPS.length - 1 && (
                  <span
                    className="hidden lg:block absolute top-6 left-[calc(50%+2.25rem)] right-[-1.25rem] h-px bg-gradient-to-r from-primary/40 to-primary/10"
                    aria-hidden="true"
                  />
                )}
                <span
                  className={`absolute -top-4 left-6 z-10 flex h-9 w-9 items-center justify-center rounded-full ${STEP_BADGE} font-display text-base font-bold shadow-md ring-4 ring-background transition-transform group-hover:scale-105`}
                  aria-hidden="true"
                >
                  {step.num}
                </span>
                <div
                  className={`h-full rounded-2xl border border-outline-variant/30 bg-white p-6 pt-7 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg ${CARD}`}
                >
                  <div className="mb-3 flex items-center gap-3">
                    <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${TILE}`}>
                      <MaterialIcon name={step.icon} size={22} />
                    </span>
                    <h3 className="font-display text-lg font-bold leading-snug text-on-surface">
                      {step.title}
                    </h3>
                  </div>
                  <p className="mt-3 text-base leading-relaxed text-on-surface-variant">{step.desc}</p>
                  <ul className="mt-4 space-y-2 border-t border-outline-variant/30 pt-4">
                    {step.points.map((point) => (
                      <li
                        key={point}
                        className="flex items-start gap-2 text-sm leading-snug text-on-surface-variant"
                      >
                        <CheckCircle className={`mt-0.5 h-4 w-4 shrink-0 ${ICON}`} />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
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
              className="inline-flex items-center gap-2 px-7 py-3 bg-primary hover:bg-primary-container text-on-primary rounded-xl font-semibold text-sm hover:from-primary hover:to-primary transition-all shadow-md shadow-primary-container/30"
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

      {/* Meet The Helpers */}
      <section className="py-16 bg-section" aria-labelledby="helpers-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-fixed text-primary text-sm font-semibold mb-3">
                <MaterialIcon name="groups" size={16} />
                Our Helpers
              </span>
              <h2
                id="helpers-heading"
                className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-on-surface mb-2"
              >
                Meet the helpers behind the work
              </h2>
              <p className="text-base text-on-surface-variant leading-relaxed">
                Each helper lists the subjects and specialisms they cover, so you can pick someone who has
                already handled work like yours. Ratings come from completed orders only.
              </p>
            </div>
            <Link
              href="/browse-helpers"
              className="inline-flex items-center gap-2 shrink-0 px-5 py-2.5 text-sm font-semibold border border-outline-variant/50 bg-white rounded-xl text-primary hover:bg-primary-fixed transition-colors"
            >
              Browse all helpers
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {helpers.length === 0 ? (
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-6 sm:p-8 text-center">
              <p className="text-base text-on-surface-variant leading-relaxed">
                Helpers are being verified now. Send us your brief and we&apos;ll match you as soon as
                your subject is covered.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 text-sm font-medium bg-primary-container text-on-primary rounded-xl hover:bg-primary transition-colors"
              >
                Request a match
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {featuredHelpers.map((helper) => {
                  const focus = helperFocus(helper.subjects);
                  const subjectTags = helper.subjects.filter((s) =>
                    SUBJECT_PAGE_BY_NAME.has(s),
                  );
                  const skillTags = helper.subjects.filter((s) => !SUBJECT_PAGE_BY_NAME.has(s));
                  return (
                    <article
                      key={helper.id}
                      className={`group bg-white rounded-2xl p-5 border border-outline-variant/30 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col ${CARD}`}
                    >
                      <div className="flex items-start gap-3 mb-4">
                        <Avatar name={helper.name} src={helper.avatar_url ?? undefined} size="lg" />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-display text-base font-bold text-on-surface truncate">
                              {helper.name}
                            </h3>
                            <span title="Verified helper">
                              <MaterialIcon name="verified" size={18} className={ICON} />
                            </span>
                          </div>
                          <p className={`text-xs uppercase tracking-wide font-semibold ${LINK}`}>
                            {focus.label}
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                            <span className="text-sm font-semibold text-on-surface">
                              {helper.rating_avg > 0 ? helper.rating_avg.toFixed(1) : "New helper"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className="text-base text-on-surface-variant leading-relaxed line-clamp-4 mb-3">
                        {helper.bio && helper.bio.trim().length > 0
                          ? helper.bio
                          : `${focus.label} support across ${helper.subjects
                              .slice(0, 3)
                              .join(", ")} — focused on ${focus.focus}.`}
                      </p>

                      <div className="flex flex-wrap gap-1.5 mb-1.5">
                        {subjectTags.map((s) => (
                          <Link
                            key={s}
                            href={SUBJECT_PAGE_BY_NAME.get(s) ?? "/subjects"}
                            className="px-2.5 py-1 rounded-full bg-primary-fixed text-primary text-xs font-medium hover:opacity-80"
                          >
                            {s}
                          </Link>
                        ))}
                        {skillTags.slice(0, 3).map((s) => (
                          <span
                            key={s}
                            className="px-2.5 py-1 rounded-full bg-section text-on-surface-variant text-xs font-medium"
                          >
                            {s}
                          </span>
                        ))}
                      </div>

                      <div className="mt-auto pt-4 flex gap-2.5">
                        <Link
                          href={`/helpers/${helper.id}`}
                          className="flex-1 text-center px-3 py-2.5 text-sm font-medium border border-outline-variant rounded-xl text-on-surface hover:bg-surface-container-low transition-colors"
                        >
                          View Profile
                        </Link>
                        <Link
                          href={`/contact?helper=${helper.id}`}
                          className="flex-1 text-center px-3 py-2.5 text-sm font-semibold text-white rounded-xl bg-primary hover:bg-primary-container transition-colors"
                        >
                          Request Help
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>

              <div className="mt-6 bg-primary-fixed/50 rounded-2xl border border-outline-variant/50 p-5">
                <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                  <p className="text-base text-on-surface-variant">
                    <span className="font-semibold text-on-surface">Subjects with helpers live today:</span>{" "}
                    {coveredSubjects.join(", ") || "publishing shortly"}.
                    {uncoveredSubjects.length > 0 && (
                      <>
                        {" "}
                        Working in {uncoveredSubjects.join(" or ")}?{" "}
                        <Link href="/contact" className="font-semibold text-primary hover:underline">
                          Send your brief
                        </Link>{" "}
                        and we&apos;ll match you.
                      </>
                    )}
                  </p>
                  <Link
                    href="/subjects"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline shrink-0"
                  >
                    See every subject we cover
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Why Students Choose Us */}
      <section className="py-16 bg-white" aria-labelledby="why-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-8">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-fixed text-primary text-sm font-semibold mb-3">
              <MaterialIcon name="thumb_up" size={16} />
              Why Acadivo
            </span>
            <h2 id="why-heading" className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-on-surface mb-2">
              Why students choose Acadivo
            </h2>
            <p className="text-base text-on-surface-variant leading-relaxed">
              We&apos;re built around the parts of assignment help that usually go wrong: unclear scope,
              unknown pricing, and work you cannot account for. Here is what changes when a verified subject
              helper is doing the guiding.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {BENEFITS.map((benefit) => {
              return (
              <div
                key={benefit.title}
                className={`bg-white rounded-2xl p-6 border border-outline-variant/30 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all ${CARD}`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${TILE}`}>
                    <MaterialIcon name={benefit.icon} size={22} className={ICON} />
                  </span>
                  <h3 className="font-display text-lg font-bold leading-snug text-on-surface">
                    {benefit.title}
                  </h3>
                </div>
                <p className="text-base text-on-surface-variant leading-relaxed mb-4">{benefit.desc}</p>
                <ul className="space-y-2">
                  {benefit.points.map((point) => (
                    <li
                      key={point}
                      className="flex items-start gap-2 text-sm leading-snug text-on-surface-variant"
                    >
                      <CheckCircle className={`mt-0.5 h-4 w-4 shrink-0 ${ICON}`} />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
              );
            })}
          </div>

          {/* Comparison */}
          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-160 text-sm border-collapse bg-white rounded-2xl overflow-hidden border border-outline-variant/30 shadow-sm">
              <caption className="sr-only">
                Acadivo compared with hiring a freelance writer and using an AI writing tool
              </caption>
              <thead>
                <tr className="bg-primary-fixed/50 text-left">
                  <th scope="col" className="px-4 py-3 font-display font-bold text-on-surface text-sm">
                    What matters
                  </th>
                  <th scope="col" className="px-4 py-3 font-display font-bold text-primary text-sm">
                    Acadivo
                  </th>
                  <th scope="col" className="px-4 py-3 font-display font-bold text-on-surface text-sm">
                    Freelance writer
                  </th>
                  <th scope="col" className="px-4 py-3 font-display font-bold text-on-surface text-sm">
                    AI writing tool
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row) => (
                  <tr key={row.criterion} className="border-t border-outline-variant/30 align-top">
                    <th scope="row" className="px-4 py-3 text-left font-medium text-on-surface text-sm">
                      {row.criterion}
                    </th>
                    <td className="px-4 py-3 text-sm text-on-surface bg-primary-fixed/30 font-medium">{row.acadivo}</td>
                    <td className="px-4 py-3 text-sm text-on-surface-variant">{row.freelancer}</td>
                    <td className="px-4 py-3 text-sm text-on-surface-variant">{row.aiTool}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Subjects We Cover */}
      <section className="py-16 bg-section" aria-labelledby="subjects-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-fixed text-primary text-xs font-semibold mb-3">
                <MaterialIcon name="category" size={16} />
                All Subjects
              </span>
              <h2
                id="subjects-heading"
                className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-on-surface mb-2"
              >
                Assignment help by subject
              </h2>
              <p className="text-base text-on-surface-variant leading-relaxed">
                From literature and history through mathematics, physics, computer science, engineering and
                nursing. Open a subject to see the topics covered, the help types available and the helpers
                who take that work.
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
              return (
              <Link
                key={s.slug}
                href={`/subjects/${s.slug}`}
                className={`group flex flex-col bg-white rounded-2xl p-5 border border-outline-variant/30 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all ${CARD}`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${TILE}`}>
                    <MaterialIcon name={s.icon} size={20} className={ICON} />
                  </span>
                  <h3 className={`font-display text-base font-bold text-on-surface transition-colors leading-snug ${LINK}`}>
                    {s.name}
                  </h3>
                </div>
                <p className="text-base text-on-surface-variant leading-relaxed">{s.cardDesc}</p>
                {s.detail && (
                  <p className="mt-2 text-base text-on-surface-variant/90 leading-relaxed">{s.detail}</p>
                )}
                <p className={`mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-semibold ${LINK}`}>
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
      <section className="py-16 bg-white" aria-labelledby="guides-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-fixed text-primary text-sm font-semibold mb-3">
                <MaterialIcon name="menu_book" size={16} />
                Free Study Guides
              </span>
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
                className={`group flex flex-col rounded-2xl border border-outline-variant/30 bg-white p-5 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 ${CARD}`}
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${TILE}`}>
                    <MaterialIcon name={guide.icon} size={20} className={ICON} />
                  </span>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold bg-primary-fixed text-primary`}>
                    {guide.meta}
                  </span>
                </div>
                <h3 className={`font-display text-base font-bold leading-snug text-on-surface transition-colors ${LINK}`}>
                  {guide.title}
                </h3>
                <p className="mt-2 text-base leading-relaxed text-on-surface-variant">{guide.description}</p>
                {guide.detail && (
                  <p className="mt-2 text-base leading-relaxed text-on-surface-variant/90">{guide.detail}</p>
                )}
                <span className={`mt-4 inline-flex items-center gap-1.5 text-sm font-semibold ${LINK}`}>
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
        className="py-16 bg-section"
        aria-labelledby="testimonials-heading"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-8">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-fixed text-primary text-sm font-semibold mb-3">
              <MaterialIcon name="format_quote" size={16} />
              Testimonials
            </span>
            <h2
              id="testimonials-heading"
              className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-on-surface mb-2"
            >
              What students say
            </h2>
            <p className="text-base text-on-surface-variant leading-relaxed">
              {testimonials.length > 0 ? (
                <>
                  Feedback from students who used Acadivo — rated{" "}
                  <span className="font-semibold text-on-surface">
                    {averageRating.toFixed(1)} / 5
                  </span>{" "}
                  on average, and every helper is a verified peer mentor.
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
                No testimonials yet — join us to be the first, and we&apos;ll feature your review here.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-white" aria-labelledby="faq-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-8">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-fixed text-primary text-sm font-semibold mb-3">
              <MaterialIcon name="help" size={16} />
              FAQ
            </span>
            <h2 id="faq-heading" className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-on-surface mb-2">
              Assignment help questions, answered
            </h2>
            <p className="text-base text-on-surface-variant leading-relaxed">
              The short version of how matching, pricing, revisions and academic integrity work on Acadivo.
              More detail on the{" "}
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
      <section className="relative overflow-hidden py-20 band-ink" aria-labelledby="cta-heading">
        <div className="absolute inset-0 band-ink-grid" aria-hidden="true" />
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
              Work one-on-one with verified peer helpers across {SUBJECTS.length} subjects and{" "}
              {HOME_SERVICE_COUNT} types of assignment help. You choose the helper, agree the scope and price
              in writing, and only pay once it looks right.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/browse-helpers"
                className="px-7 py-3 bg-white text-ink-900 rounded-xl font-semibold text-sm hover:bg-primary-fixed transition-colors shadow-lg shadow-ink-900/40 inline-flex items-center gap-2"
              >
                Browse Helpers
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
    </>
  );
}
