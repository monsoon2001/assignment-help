import {
  BookOpen,
  ClipboardList,
  HandCoins,
  MessageSquare,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { SUBJECTS, SERVICE_TYPES, ACADEMIC_LEVELS } from "@/lib/constants";
import { SUPPORTED_CURRENCIES, currencySymbol } from "@/lib/currency";

const FLOW = [
  {
    icon: ClipboardList,
    title: "Describe your task",
    body: "Pick a subject, add your academic level, share the brief and attach any files.",
  },
  {
    icon: Search,
    title: "Match with a helper",
    body: "We surface verified helpers who actually cover that subject and level.",
  },
  {
    icon: MessageSquare,
    title: "Agree the scope",
    body: "Chat directly, agree a price and a deadline before anything is charged.",
  },
  {
    icon: HandCoins,
    title: "Pay after you approve",
    body: "You only pay once you accept the offer, and helpers are paid on delivery.",
  },
];

const SAMPLE = {
  subject: "Biology",
  service: "Lab Report",
  level: "Undergraduate",
  deadline: "3 days",
};

export default function AuthShowcase() {
  return (
    <aside className="relative hidden h-full min-h-0 overflow-hidden bg-on-surface lg:block">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 -right-24 h-96 w-96 rounded-full bg-primary-container/40 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-primary/40 blur-3xl"
      />

      <div className="relative flex h-full min-h-0 flex-col justify-between gap-6 overflow-y-auto px-10 py-10 text-inverse-on-surface">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-inverse-primary/15 px-3 py-1.5 text-xs font-semibold text-inverse-primary ring-1 ring-inverse-primary/25">
            <Sparkles size={13} />
            Peer-to-peer academic guidance
          </span>
          <h2 className="mt-5 font-display text-3xl font-bold leading-tight text-inverse-on-surface xl:text-4xl">
            Get the help you need,
            <br />
            from someone who has done it.
          </h2>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-inverse-on-surface/70">
            Acadivo connects students with verified peer helpers across {SUBJECTS.length} subjects
            and {SERVICE_TYPES.length} types of help. Helpers teach and review — they never write
            your submission for you.
          </p>
        </div>

        <div className="rounded-2xl border border-inverse-on-surface/15 bg-inverse-on-surface/[0.06] p-5 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-inverse-primary">
            <BookOpen size={14} />
            Example request
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {[SAMPLE.service, SAMPLE.subject, SAMPLE.level, `Due in ${SAMPLE.deadline}`].map(
              (tag) => (
                <span
                  key={tag}
                  className="rounded-lg bg-inverse-primary/15 px-2.5 py-1 text-xs font-semibold text-inverse-on-surface"
                >
                  {tag}
                </span>
              )
            )}
          </div>

          <div className="mt-5 space-y-3 border-t border-inverse-on-surface/12 pt-5">
            {FLOW.map((step) => (
              <div key={step.title} className="flex gap-3">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-inverse-primary/15 text-inverse-primary">
                  <step.icon size={14} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-inverse-on-surface">{step.title}</p>
                  <p className="text-xs leading-relaxed text-inverse-on-surface/65">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-inverse-on-surface/50">
            Subjects covered
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {SUBJECTS.map((subject) => (
              <span
                key={subject}
                className="rounded-md bg-inverse-on-surface/10 px-2 py-1 text-[11px] font-medium text-inverse-on-surface/80"
              >
                {subject}
              </span>
            ))}
          </div>

          <div className="mt-6 grid gap-3 border-t border-inverse-on-surface/12 pt-5 sm:grid-cols-2">
            <div>
              <p className="flex items-center gap-1.5 text-xs font-semibold text-inverse-on-surface/80">
                <ShieldCheck size={13} className="text-inverse-primary" />
                Academic levels
              </p>
              <p className="mt-1 text-xs text-inverse-on-surface/60">
                {ACADEMIC_LEVELS.join(" · ")}
              </p>
            </div>
            <div>
              <p className="flex items-center gap-1.5 text-xs font-semibold text-inverse-on-surface/80">
                <HandCoins size={13} className="text-inverse-primary" />
                Pay in your currency
              </p>
              <p className="mt-1 text-xs text-inverse-on-surface/60">
                {SUPPORTED_CURRENCIES.map((code) => currencySymbol(code)).join(" · ")} — default
                picked from your country
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
