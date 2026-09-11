import Link from "next/link";
import { Star, CheckCircle, ArrowRight } from "lucide-react";
import PriceEstimateForm from "@/components/marketing/price-estimate-form";

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
  { num: "4", icon: "task_alt", title: "Get completed work", desc: "Get your completed work with 2 free revision rounds within 14 days. Payments are final — no refunds." },
];

const helpers = [
  { name: "Maya R.", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face", rating: 4.9, reviews: 127, subjects: ["English Literature", "Essay Writing"], specialty: "MLA & APA Formatting Expert" },
  { name: "Daniel K.", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face", rating: 4.8, reviews: 98, subjects: ["Statistics", "Mathematics"], specialty: "Data Analysis & Research Methods" },
  { name: "Priya S.", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face", rating: 4.9, reviews: 156, subjects: ["Biology", "Chemistry"], specialty: "Lab Reports & Scientific Writing" },
];

const benefits = [
  { icon: "paid", title: "Clear Pricing", desc: "Know exactly what you'll pay upfront. No surprise charges, no hidden fees." },
  { icon: "chat", title: "Direct Communication", desc: "Message your helper directly. Ask questions, share files, and track progress." },
  { icon: "verified", title: "Quality You Can Trust", desc: "Every helper is vetted. Work is reviewed for accuracy and originality." },
  { icon: "replay", title: "Simple Revisions", desc: "Not quite right? You get 2 free revision rounds within 14 days of delivery — payments are final, quality is guaranteed." },
];

const subjects = ["English Literature", "Mathematics", "Biology", "Chemistry", "Physics", "Computer Science", "History", "Psychology", "Economics", "Business Studies", "Nursing", "Engineering", "Statistics", "Philosophy", "Sociology", "Political Science"];

const marqueeItems = [
  "Essay Writing",
  "Report Writing",
  "Proofreading",
  "Editing",
  "Plagiarism Check",
  "AI Detector",
  "Similarity Check",
  "Paraphrasing",
  "MLA & APA Formatting",
  "Citation & Referencing",
  "Thesis & Dissertation",
  "Case Study",
  "Literature Review",
  "Research Proposal",
  "Lab Report",
  "Math & Statistics Help",
  "Programming Help",
  "Data Analysis",
  "Business Plan",
  "Personal Statement",
  "Presentation & Slides",
];

const testimonials = [
  { name: "Alex M.", role: "English Major", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face", rating: 5, text: "Maya helped me structure my thesis argument beautifully. The step-by-step feedback was invaluable — I learned more in one session than in weeks of struggling alone." },
  { name: "Sarah L.", role: "Biology Student", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face", rating: 5, text: "Priya's guidance on my lab report was exceptional. She helped me understand the methodology deeply instead of just fixing the writing." },
  { name: "James W.", role: "Business Student", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face", rating: 5, text: "Daniel's project guidance was exactly what I needed. He walked me through the data analysis step by step, and the final report came together clearly. Direct communication, clear pricing, and the result exceeded my expectations." },
];

export default function HomePage() {
  return (
    <>
      {/* Trust Banner */}
      <div className="bg-surface-container-high border-b border-outline-variant/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-center gap-6 text-xs font-medium text-on-surface-variant flex-wrap">
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm text-primary">verified</span>
            Verified Academic Mentors &amp; Subject Helpers
          </span>
          <span className="hidden sm:inline text-outline-variant">|</span>
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm text-primary">verified_user</span>
            100% Human-Written Work — No AI-Generated Content
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
                Get expert help with your essays, reports, and assignments.
              </h1>
              <p className="text-lg text-on-surface-variant leading-relaxed max-w-xl">
                Connect with verified peer helpers who guide you through coursework, improve your writing, and help you understand concepts — so you can learn effectively and submit with confidence.
              </p>

              {/* Trust Checkmarks */}
              <div className="flex flex-col sm:flex-row gap-4 text-sm text-on-surface-variant">
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                  Plagiarism-free guidance
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

              {/* Rating Panel */}
              <div className="flex items-center gap-4 pt-2">
                <div className="flex -space-x-2">
                  {["https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face", "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face", "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face"].map((src, i) => (
                    <img key={i} src={src} alt="" className="w-9 h-9 rounded-full border-2 border-surface-container-lowest object-cover" />
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                    <span className="text-sm font-semibold text-on-surface ml-1">4.9</span>
                  </div>
                  <p className="text-xs text-on-surface-variant">Trusted by 2,000+ students</p>
                </div>
              </div>
            </div>

            {/* Right Column - Price Estimate Form */}
            <div className="bg-surface-container-lowest rounded-2xl shadow-lg border border-outline-variant/30 p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary-container/10 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary">calculate</span>
                </div>
                <div>
                  <h2 className="font-display font-bold text-on-surface">Get a Price Estimate</h2>
                  <p className="text-xs text-on-surface-variant">Describe your assignment for a quick quote</p>
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
              <div key={helper.name} className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4 mb-4">
                  <img src={helper.avatar} alt={helper.name} className="w-14 h-14 rounded-full object-cover" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-display font-bold text-on-surface">{helper.name}</h3>
                      <span className="material-symbols-outlined text-primary text-sm">verified</span>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-semibold text-on-surface">{helper.rating}</span>
                      <span className="text-xs text-on-surface-variant">({helper.reviews} reviews)</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-on-surface-variant mb-3">{helper.specialty}</p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {helper.subjects.map((s) => (
                    <span key={s} className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-xs font-medium">{s}</span>
                  ))}
                </div>
                <div className="flex gap-3">
                  <Link href={`/helpers/${helper.name.toLowerCase().replace(/\s+/g, "-")}`} className="flex-1 text-center px-4 py-2 text-sm font-medium border border-outline-variant rounded-xl text-on-surface hover:bg-surface-container-low transition-colors">
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
              Why PeerCraft
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
            <p className="text-on-surface-variant max-w-2xl mx-auto">Real feedback from students who&apos;ve used PeerCraft for academic guidance</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-on-surface-variant leading-relaxed mb-6">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3 pt-4 border-t border-outline-variant/30">
                  <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <p className="text-sm font-semibold text-on-surface">{t.name}</p>
                    <p className="text-xs text-on-surface-variant">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
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
            Join thousands of students who&apos;ve improved their grades and understanding with the help of verified peer experts.
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
