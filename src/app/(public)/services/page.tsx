import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Button from "@/components/ui/button";
import { CtaBand, PAGE_TONES, PageHeader } from "@/components/marketing/page-shell";
import { MaterialIcon } from "@/lib/icons-map";
import { GUIDE_BY_SERVICE, SERVICE_GROUPS } from "@/lib/services";

export default function ServicesPage() {
  return (
    <>
      <PageHeader
        title="Services"
        subtitle="Everything Acadivo can help with — from drafting and editing to quality checks and technical guidance."
        crumbs={[{ label: "Home", href: "/" }, { label: "Services" }]}
      />

      <div className="band-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="space-y-16">
          {SERVICE_GROUPS.map((group) => {
            const groupTone = PAGE_TONES.blue;
            return (
            <div key={group.title} id={group.id} className="scroll-mt-24">
              <div className="flex items-start gap-3 mb-8">
                <span className={`w-11 h-11 rounded-xl ${groupTone.iconTile} ${groupTone.icon} flex items-center justify-center shrink-0`}>
                  <MaterialIcon name={group.icon} size={24} />
                </span>
                <div>
                  <h2 className="font-display text-2xl font-bold text-on-surface">{group.title}</h2>
                  <p className="text-base text-on-surface-variant mt-1 leading-relaxed">{group.description}</p>
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
                    <p className="text-base text-on-surface-variant leading-relaxed flex-1">{s.desc}</p>
                    {GUIDE_BY_SERVICE[s.name] && (
                      <Link
                        href={GUIDE_BY_SERVICE[s.name]}
                        className={`text-xs font-semibold ${groupTone.text} hover:underline mt-3 inline-flex items-center min-h-11`}
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

        <div className="mt-16 text-center bg-white rounded-2xl p-8 sm:p-12 border border-primary-container/30 shadow-md shadow-primary-container/10 relative overflow-hidden">
          <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary-container to-primary" aria-hidden="true" />
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-on-surface mb-3">Want to learn the process first?</h2>
          <p className="text-on-surface-variant mb-8 max-w-lg mx-auto leading-relaxed">
            Our free student guides explain step by step how to approach each of these tasks, with examples and
            checklists.
          </p>
          <Button href="/resources" size="lg" className="shadow-md shadow-primary-container/20">
            Browse Student Guides
            <ArrowRight className="w-4 h-4" />
          </Button>
          <div className="mt-12 pt-10 border-t border-outline-variant/40">
          <h2 className="font-display text-2xl font-bold text-on-surface mb-3">Don&apos;t see what you need?</h2>
          <p className="text-on-surface-variant mb-6 max-w-lg mx-auto leading-relaxed">
            We support many more subject areas and task types. Tell us about your assignment and we&apos;ll help you get started.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button href="/browse-helpers" size="lg" className="shadow-md shadow-primary-container/25">
              Find a Helper
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button href="/contact" variant="outline" size="lg">
              Contact Us
            </Button>
          </div>
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
