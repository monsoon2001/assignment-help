import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CtaBand, PAGE_TONES, PageHeader } from "@/components/marketing/page-shell";
import { GUIDE_BY_SERVICE, SERVICE_GROUPS } from "@/lib/services";

export default function ServicesPage() {
  return (
    <>
      <PageHeader
        tone="teal"
        icon="design_services"
        eyebrow="Services"
        title="Services"
        subtitle="Everything Acadivo can help with — from drafting and editing to quality checks and technical guidance."
        crumbs={[{ label: "Home", href: "/" }, { label: "Services" }]}
      />

      <div className="bg-white wash-teal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-16">
          {SERVICE_GROUPS.map((group, gi) => {
            const groupTone = [PAGE_TONES.teal, PAGE_TONES.amber, PAGE_TONES.violet, PAGE_TONES.rose][gi % 4];
            return (
            <div key={group.title} id={group.id} className="scroll-mt-24">
              <div className="flex items-start gap-3 mb-8">
                <span className={`w-11 h-11 rounded-xl ${groupTone.iconTile} ${groupTone.icon} flex items-center justify-center shrink-0`}>
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
                    className={`relative overflow-hidden bg-white rounded-2xl p-5 border ${groupTone.card} shadow-sm ${groupTone.cardHover} transition-all flex flex-col`}
                  >
                    <span className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${groupTone.hairline}`} aria-hidden="true" />
                    <h3 className="font-semibold text-on-surface mb-1.5 pt-1">{s.name}</h3>
                    <p className="text-sm text-on-surface-variant leading-relaxed flex-1">{s.desc}</p>
                    {GUIDE_BY_SERVICE[s.name] && (
                      <Link
                        href={GUIDE_BY_SERVICE[s.name]}
                        className={`text-xs font-semibold ${groupTone.text} hover:underline mt-3`}
                      >
                        Read the free guide &rarr;
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>
            );
          })}
        </div>

        <div className="mt-16 text-center bg-white rounded-2xl p-10 border border-outline-variant/30 shadow-sm">
          <h2 className="font-display text-2xl font-bold text-on-surface mb-2">Want to learn the process first?</h2>
          <p className="text-on-surface-variant mb-6 max-w-lg mx-auto">
            Our free student guides explain step by step how to approach each of these tasks, with examples and
            checklists.
          </p>
          <Link href="/resources" className="inline-flex items-center gap-2 mb-10 px-8 py-3.5 bg-gradient-to-r from-accent-amber to-accent-rose text-white rounded-xl font-semibold text-sm hover:opacity-95 transition-opacity shadow-md shadow-accent-amber/25">
            Browse Student Guides
            <ArrowRight className="w-4 h-4" />
          </Link>
          <h2 className="font-display text-2xl font-bold text-on-surface mb-2">Don&apos;t see what you need?</h2>
          <p className="text-on-surface-variant mb-6 max-w-lg mx-auto">
            We support many more subject areas and task types. Tell us about your assignment and we&apos;ll help you get started.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/browse-helpers" className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-primary-container to-accent-teal text-white rounded-xl font-semibold text-sm hover:opacity-95 transition-opacity shadow-md shadow-primary-container/25">
              Find a Helper
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/contact" className="inline-flex items-center px-8 py-3.5 border border-outline-variant rounded-xl font-semibold text-sm text-on-surface hover:bg-surface-container-low transition-colors">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
      </div>

      <CtaBand
        eyebrow="forum"
        title="Not sure which service fits?"
        body="Tell us the assignment and deadline. We'll point you at the right help type and the helpers who cover it."
        primary={{ label: "Browse Helpers", href: "/browse-helpers" }}
        secondary={{ label: "Contact Us", href: "/contact" }}
      />
    </>
  );
}