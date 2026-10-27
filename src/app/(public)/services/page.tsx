import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import Button from "@/components/ui/button";
import { CtaBand, PageHeader } from "@/components/marketing/page-shell";
import { MaterialIcon } from "@/lib/icons-map";
import { GUIDE_BY_SERVICE, SERVICE_GROUPS } from "@/lib/services";
import { accentForIndex, accentForService } from "@/lib/accent-styles";

export const metadata: Metadata = {
  title: "Services | Assignment, Writing, Editing & Study Help | Acadivo",
  description:
    "See every type of academic help Acadivo offers — essays, reports, research, proofreading, editing, citations, presentations, and study support from a verified helper.",
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return (
    <>
      <PageHeader
        title="Services"
        subtitle="Everything Acadivo can help with — from drafting and editing to quality checks and technical guidance."
        crumbs={[{ label: "Home", href: "/" }, { label: "Services" }]}
      />

      <div className="band-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <div className="space-y-16">
            {SERVICE_GROUPS.map((group, groupIndex) => {
              const groupTone = accentForIndex(groupIndex);
              return (
                <div key={group.title} id={group.id} className="scroll-mt-24">
                  <div className="flex items-start gap-3 mb-8">
                    <span
                      className={`w-11 h-11 rounded-xl ${groupTone.tile} ${groupTone.icon} flex items-center justify-center shrink-0`}
                    >
                      <MaterialIcon name={group.icon} size={24} />
                    </span>
                    <div>
                      <h2 className="font-display text-2xl font-bold text-on-surface">
                        {group.title}
                      </h2>
                      <p className="text-base text-on-surface-variant mt-1 leading-relaxed">
                        {group.description}
                      </p>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {group.services.map((s) => {
                      const accent = accentForService(s.slug);
                      return (
                        <div
                          key={s.name}
                          className={`group flex min-h-56 flex-col rounded-2xl border border-outline-variant/40 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${accent.cardHover}`}
                        >
                          <div className="mb-4 flex items-center gap-3">
                            <span
                              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${accent.tile}`}
                            >
                              <MaterialIcon name={group.icon} size={20} className={accent.icon} />
                            </span>
                            <h3 className={`font-display font-bold leading-snug ${accent.text}`}>
                              {s.name}
                            </h3>
                          </div>
                          <p className="flex-1 text-base leading-relaxed text-on-surface-variant">
                            {s.desc}
                          </p>
                          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1">
                            <Link
                              href={`/services/${s.slug}`}
                              className={`inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold hover:underline ${accent.text}`}
                            >
                              Explore service
                              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                            </Link>
                            {GUIDE_BY_SERVICE[s.name] && (
                              <Link
                                href={GUIDE_BY_SERVICE[s.name]}
                                className="inline-flex min-h-11 items-center text-sm font-semibold text-on-surface-variant hover:text-on-surface hover:underline"
                              >
                                Free guide
                              </Link>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-16 text-center bg-white rounded-2xl p-8 sm:p-12 border border-primary-container/30 shadow-md shadow-primary-container/10 relative overflow-hidden">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-on-surface mb-3">
              Want to learn the process first?
            </h2>
            <p className="text-on-surface-variant mb-8 max-w-lg mx-auto leading-relaxed">
              Our free student guides explain step by step how to approach each of these tasks, with
              examples and checklists.
            </p>
            <Button href="/resources" size="lg" className="shadow-md shadow-primary-container/20">
              Browse Student Guides
              <ArrowRight className="w-4 h-4" />
            </Button>
            <div className="mt-12 pt-10 border-t border-outline-variant/40">
              <h2 className="font-display text-2xl font-bold text-on-surface mb-3">
                Don&apos;t see what you need?
              </h2>
              <p className="text-on-surface-variant mb-6 max-w-lg mx-auto leading-relaxed">
                We support many more subject areas and task types. Tell us about your assignment and
                we&apos;ll help you get started.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  href="/requests/new"
                  size="lg"
                  className="shadow-md shadow-primary-container/25"
                >
                  Request Help
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
        body="Tell us the assignment and deadline. We'll point you at the right help type and get your request to our verified helper."
        primary={{ label: "Request Help", href: "/requests/new" }}
        secondary={{ label: "Contact Us", href: "/contact" }}
      />
    </>
  );
}
