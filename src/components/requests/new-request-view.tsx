"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FileText, Info, CheckCircle2, ShieldCheck } from "lucide-react";
import Card from "@/components/ui/card";
import TaskRequestForm, {
  HELP_TYPE_OPTIONS,
  LAST_DUE_TIME,
  WORDS_PER_PAGE,
  normalizePages,
  SUBJECT_OPTIONS,
  type TaskRequestField,
  type TaskRequestFormValues,
} from "@/components/requests/task-request-form";
import {
  submitRequest, loadPendingDraft, clearPendingDraft, loadDraftFiles, clearDraftFiles,
} from "@/lib/requests";

import { OTHER_OPTION, withCustom } from "@/lib/constants";
import { countryNameFor, formatCurrency, defaultCurrencyForCountry } from "@/lib/currency";
import { Skeleton } from "@/components/ui/skeleton";

// Indicative budget guidance, quoted in CAD (the settlement currency).
const PRICING_BANDS = [
  { label: "Essays (per page)", from: 7, to: 15 },
  { label: "Problem sets (per set)", from: 35, to: 90 },
  { label: "Reports (per report)", from: 60, to: 160 },
  { label: "Research help (per hour)", from: 20, to: 40 },
];

function resolveDraftSelection(options: readonly string[], value?: string): { value: string; custom: string } {
  if (!value) return { value: "", custom: "" };
  const parsed = withCustom(value);
  if (parsed.isOther) return { value: OTHER_OPTION, custom: parsed.raw };
  const match =
    options.find((o) => o.toLowerCase() === parsed.value.toLowerCase()) ??
    options.find(
      (o) =>
        o.toLowerCase().includes(parsed.value.toLowerCase()) ||
        parsed.value.toLowerCase().includes(o.toLowerCase())
    );
  if (match) return { value: match, custom: "" };
  return { value: OTHER_OPTION, custom: parsed.value };
}

const DRAFT_DEADLINE_MS: Record<string, number> = {
  "24 hours": 24 * 60 * 60 * 1000,
  "3 days": 3 * 24 * 60 * 60 * 1000,
  "1 week": 7 * 24 * 60 * 60 * 1000,
  "2 weeks": 14 * 24 * 60 * 60 * 1000,
};

function deadlineFromKey(key?: string): string {
  const ms = DRAFT_DEADLINE_MS[key ?? ""];
  if (!ms) return "";
  return new Date(Date.now() + ms).toISOString().slice(0, 10);
}

// Best-effort country hint from the browser locale (e.g. "en-CA" -> CA), used
// when the profile and request IP didn't resolve to a known country (local dev).
function browserRegion(): string | null {
  if (typeof navigator === "undefined") return null;
  try {
    const langs = navigator.languages && navigator.languages.length > 0
      ? navigator.languages
      : [navigator.language];
    for (const lang of langs) {
      const parts = lang.split("-");
      for (let i = parts.length - 1; i >= 0; i--) {
        const segment = parts[i];
        if (/^[A-Za-z]{2}$/.test(segment)) return segment.toUpperCase();
      }
    }
  } catch {
    // ignore
  }
  return null;
}

export default function NewRequestView({
  defaultCountry,
  countryKnown,
}: {
  defaultCountry: string;
  countryKnown: boolean;
}) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [values, setValues] = useState<TaskRequestFormValues>({
    subject: "",
    customSubject: "",
    helpType: "",
    customHelpType: "",
    level: "",
    deadline: "",
    dueTime: LAST_DUE_TIME,
    pages: "",
    details: "",
    files: [],
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const set = useCallback(<K extends TaskRequestField>(
    key: K,
    value: TaskRequestFormValues[K]
  ) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setError("");
  }, []);

  // Restores the draft the homepage estimate form saved across sign-in/sign-up.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const d = loadPendingDraft();
      const saved = await loadDraftFiles();
      if (cancelled) return;
      if (d) clearPendingDraft();
      if (d) {
        const dd = resolveDraftSelection(HELP_TYPE_OPTIONS, d.service);
        const ds = resolveDraftSelection(SUBJECT_OPTIONS, d.subject);
        setValues((prev) => ({
          ...prev,
          helpType: dd.value,
          customHelpType: dd.custom,
          subject: ds.value,
          customSubject: ds.custom,
          pages: normalizePages(d.wordCount),
          deadline: d.deadline ?? (d.deadlineKey ? deadlineFromKey(d.deadlineKey) : prev.deadline),
          dueTime: d.dueTime || LAST_DUE_TIME,
          details: d.details ?? prev.details,
          level: d.level ?? prev.level,
        }));
      }
      if (saved.length > 0) setValues((prev) => ({ ...prev, files: saved }));
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const resolvedHelpType =
    values.helpType === OTHER_OPTION && values.customHelpType.trim()
      ? values.customHelpType.trim()
      : values.helpType;

  const resolvedSubject =
    values.subject === OTHER_OPTION && values.customSubject.trim()
      ? values.customSubject.trim()
      : values.subject;

  const effectiveCountry =
    !countryKnown && typeof window !== "undefined"
      ? countryNameFor(browserRegion()) ?? defaultCountry
      : defaultCountry;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setError("");

    if (values.helpType === OTHER_OPTION && !values.customHelpType.trim()) {
      setError("Please select the type of help you need.");
      return;
    }
    if (!resolvedHelpType) {
      setError("Please select the type of help you need.");
      return;
    }
    if (values.subject === OTHER_OPTION && !values.customSubject.trim()) {
      setError("Please select a subject.");
      return;
    }
    if (!resolvedSubject) {
      setError("Please select a subject.");
      return;
    }
    if (!values.level) {
      setError("Please select your academic level.");
      return;
    }
    if (!values.deadline) {
      setError("Please choose a deadline.");
      return;
    }
    if (!values.details.trim() && !values.pages.trim()) {
      setError("Add pages/words or a short description so a helper can assess the scope.");
      return;
    }

    setSubmitting(true);

    const title = `${resolvedHelpType} — ${resolvedSubject}`;
    const descriptionWithMeta = [
      values.details,
      values.level ? `Academic level: ${values.level}` : "",
      values.pages
        ? `Expected length: ${values.pages} page${Number(values.pages) === 1 ? "" : "s"} (approx ${(Number(values.pages) || 0) * WORDS_PER_PAGE} words)`
        : "",
      `Country: ${effectiveCountry} (bills in ${defaultCurrencyForCountry(effectiveCountry)})`,
    ]
      .filter(Boolean)
      .join("\n\n");

    const result = await submitRequest({
      title,
      description: descriptionWithMeta || undefined,
      subject: resolvedSubject,
      country: effectiveCountry,
      deadline: values.deadline
        ? new Date(`${values.deadline}T${values.dueTime || LAST_DUE_TIME}:00`).toISOString()
        : null,
      files: values.files,
    });

    setSubmitting(false);
    if ("error" in result) {
      setError(result.error);
      return;
    }
    clearPendingDraft();
    await clearDraftFiles();
    router.push(`/requests/sent?id=${result.id}`);
  };

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <span className="w-12 h-12 rounded-xl bg-primary-container text-on-primary flex items-center justify-center shrink-0">
          <FileText size={22} />
        </span>
        <div>
          <h1 className="font-display font-bold text-2xl text-on-surface">Request Academic Help</h1>
          <p className="text-sm text-on-surface-variant">
            Describe your assignment and send it straight to our academic helper.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <Card className="lg:col-span-2 p-6 sm:p-8">
          {!ready ? (
            <div className="flex flex-col gap-3" aria-busy="true" aria-live="polite">
              <span className="sr-only">Preparing your request…</span>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="flex flex-col gap-1">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-10 w-full rounded-lg" />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex flex-col gap-1">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-10 w-full rounded-lg" />
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-1">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
              <Skeleton className="h-16 w-full rounded-lg" />
              <Skeleton className="h-11 w-full rounded-xl" />
            </div>
          ) : (
            <TaskRequestForm
              values={values}
              set={set}
              error={error}
              onSubmit={handleSubmit}
              submitting={submitting}
              submitLabel="Send Task Request"
              note="Your request goes straight to our verified academic helper. No charge until you accept a proposal."
            />
          )}
        </Card>

        <div className="flex flex-col gap-4">
          <Card className="p-5">
            <h2 className="font-semibold text-sm text-on-surface mb-3 flex items-center gap-2">
              <Info size={15} className="text-primary" />
              Pricing &amp; Timeline
            </h2>
            <div className="space-y-2.5 text-sm">
              {PRICING_BANDS.map((band) => (
                <div key={band.label} className="flex items-center justify-between">
                  <span className="text-on-surface-variant">{band.label}</span>
                  <span className="font-semibold text-on-surface">
                    {formatCurrency(band.from)} –{" "}
                    {formatCurrency(band.to)}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-on-surface-variant mt-3 leading-relaxed">
              Indicative guidance in <span className="font-semibold">CAD</span>; you&apos;ll be charged in your
              local currency at checkout. Your helper responds in the request chat within{" "}
              <span className="font-semibold">2 hours</span>. Rush orders under 12 hours carry a{" "}
              <span className="font-semibold">+25%</span> premium.
            </p>
          </Card>

          <Card className="p-5 bg-surface-container-low border border-outline-variant">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck size={16} className="text-success" />
              <h3 className="font-semibold text-sm text-on-surface">Why students trust Acadivo</h3>
            </div>
            <ul className="space-y-2 text-xs text-on-surface-variant leading-relaxed">
              <li className="flex items-start gap-2">
                <CheckCircle2 size={13} className="text-success shrink-0 mt-0.5" /> Subject-matter experts verified against university records.
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={13} className="text-success shrink-0 mt-0.5" /> Revisions until you are satisfied with the draft.
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={13} className="text-success shrink-0 mt-0.5" /> You approve each draft and can request revisions until it meets the agreed scope.
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
