import Link from "next/link";
import { ChevronRight, ArrowRight } from "lucide-react";

const serviceGroups = [
  {
    title: "Writing & Editing",
    icon: "edit_note",
    description: "Guided support for drafting, polishing, and structuring written work across subjects.",
    services: [
      { name: "Essay Writing", desc: "Thesis-driven essays guided from outline to final draft — structure, argument, and clarity." },
      { name: "Report Writing", desc: "Well-organized academic, lab, and business reports with clear sections and findings." },
      { name: "Proofreading", desc: "Correction of grammar, spelling, punctuation, and sentence flow before you submit." },
      { name: "Editing", desc: "Deeper revision of clarity, tone, structure, and the strength of your argument." },
      { name: "Paraphrasing", desc: "Rewriting content into your own words while keeping the meaning intact and avoiding plagiarism." },
      { name: "MLA & APA Formatting", desc: "Proper formatting and citation style applied consistently across your document." },
      { name: "Citation & Referencing", desc: "Accurate in-text citations and reference lists in MLA, APA, Chicago, Harvard, or IEEE." },
    ],
  },
  {
    title: "Quality Checks",
    icon: "verified",
    description: "Pre-submission scans so your work is original, authentic, and ready to hand in.",
    services: [
      { name: "Plagiarism Check", desc: "Originality review against academic sources to keep your work submission-safe." },
      { name: "AI Detector", desc: "Review of AI-generated content indicators so your work reads genuinely yours." },
      { name: "Similarity Check", desc: "Similarity scoring and guidance on reducing overlap before submission." },
    ],
  },
  {
    title: "Research & Advanced Projects",
    icon: "menu_book",
    description: "Long-form and research-heavy projects, guided chapter by chapter.",
    services: [
      { name: "Thesis & Dissertation", desc: "Chapter-by-chapter guidance for structure, argument, and academic writing." },
      { name: "Case Study", desc: "Analysis and write-up of real-world scenarios with frameworks and evidence." },
      { name: "Literature Review", desc: "Synthesizing sources into a coherent, critical review of the field." },
      { name: "Research Proposal", desc: "Framing aims, research questions, and methodology for approval." },
      { name: "Lab Report", desc: "Scientific write-ups — methods, results, analysis, and discussion." },
    ],
  },
  {
    title: "Technical & Data Help",
    icon: "functions",
    description: "Support for quantitative coursework and technical assignments.",
    services: [
      { name: "Math & Statistics Help", desc: "Problem solving, derivations, and statistical analysis explained step by step." },
      { name: "Programming Help", desc: "Guidance on algorithms, projects, and debugging across languages." },
      { name: "Data Analysis", desc: "Analysis and visualization using Excel, SPSS, R, or Python." },
    ],
  },
  {
    title: "Career & Presentation",
    icon: "business_center",
    description: "Positioning support for applications, plans, and presentations.",
    services: [
      { name: "Business Plan", desc: "Structuring plans with market analysis, financials, and a clear strategy." },
      { name: "Personal Statement", desc: "Admission and application essays that tell your story effectively." },
      { name: "Presentation & Slides", desc: "Deck design and narrative structure for confident presentations." },
    ],
  },
];

export default function ServicesPage() {
  return (
    <>
      <div className="bg-surface-container-high border-b border-outline-variant/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <nav className="flex items-center gap-2 text-sm text-on-surface-variant mb-4">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-on-surface font-medium">Services</span>
          </nav>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-on-surface mb-2">Services</h1>
          <p className="text-on-surface-variant max-w-2xl">
            Everything PeerCraft can help with — from drafting and editing to quality checks and technical guidance.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-16">
          {serviceGroups.map((group) => (
            <div key={group.title}>
              <div className="flex items-start gap-3 mb-8">
                <span className="w-11 h-11 rounded-xl bg-primary-container text-on-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined">{group.icon}</span>
                </span>
                <div>
                  <h2 className="font-display text-2xl font-bold text-on-surface">{group.title}</h2>
                  <p className="text-sm text-on-surface-variant mt-1">{group.description}</p>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.services.map((s) => (
                  <div
                    key={s.name}
                    className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/30 flex flex-col"
                  >
                    <h3 className="font-semibold text-on-surface mb-1.5">{s.name}</h3>
                    <p className="text-sm text-on-surface-variant leading-relaxed flex-1">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center bg-surface-container-high rounded-2xl p-10">
          <h2 className="font-display text-2xl font-bold text-on-surface mb-2">Don&apos;t see what you need?</h2>
          <p className="text-on-surface-variant mb-6 max-w-lg mx-auto">
            We support many more subject areas and task types. Tell us about your assignment and we&apos;ll help you get started.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/browse-helpers" className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary-container text-on-primary rounded-xl font-semibold text-sm hover:bg-primary transition-colors">
              Find a Helper
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/contact" className="inline-flex items-center px-8 py-3.5 border border-outline-variant rounded-xl font-semibold text-sm text-on-surface hover:bg-surface-container-low transition-colors">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}