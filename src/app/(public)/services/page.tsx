import Link from "next/link";
import { ChevronRight, ArrowRight } from "lucide-react";
import { GUIDE_BY_SERVICE, SERVICE_GROUPS } from "@/lib/services";

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
            Everything Acadivo can help with — from drafting and editing to quality checks and technical guidance.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-16">
          {SERVICE_GROUPS.map((group) => (
            <div key={group.title} id={group.id} className="scroll-mt-24">
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
                    {GUIDE_BY_SERVICE[s.name] && (
                      <Link
                        href={GUIDE_BY_SERVICE[s.name]}
                        className="text-xs font-medium text-primary hover:underline mt-3"
                      >
                        Read the free guide &rarr;
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center bg-surface-container-high rounded-2xl p-10">
          <h2 className="font-display text-2xl font-bold text-on-surface mb-2">Want to learn the process first?</h2>
          <p className="text-on-surface-variant mb-6 max-w-lg mx-auto">
            Our free student guides explain step by step how to approach each of these tasks, with examples and
            checklists.
          </p>
          <Link href="/resources" className="inline-flex items-center gap-2 mb-10 px-8 py-3.5 bg-primary-container text-on-primary rounded-xl font-semibold text-sm hover:bg-primary transition-colors">
            Browse Student Guides
            <ArrowRight className="w-4 h-4" />
          </Link>
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