"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FileText, Info, CheckCircle2, ShieldCheck, Loader2, ArrowLeft } from "lucide-react";
import Card from "@/components/ui/card";
import HelperPicker from "@/components/requests/helper-picker";
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
  type HelperCandidate,
} from "@/lib/requests";

import { OTHER_OPTION, withCustom } from "@/lib/constants";
import { DEFAULT_COUNTRY, convertCurrency, formatCurrency, defaultCurrencyForCountry } from "@/lib/currency";
import { Skeleton } from "@/components/ui/skeleton";

// Indicative bands, quoted in USD and converted to the student's currency.
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

export default function NewRequestPage() {
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
  const [step, setStep] = useState<"details" | "helper">("details");
  // /requests/new?helper=<id> (from "Request Help" on a helper card) keeps the
  // chosen helper selected once the student reaches the helper step.
  const searchParams = useSearchParams();
  const preselectedHelper = searchParams.get("helper");
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
  // The details step stays on screen (filled in) so the student can review it
  // before choosing a helper.
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

  const quoteCurrency = defaultCurrencyForCountry(DEFAULT_COUNTRY);

  const handleContinue = () => {
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
    setStep("helper");
  };

  const handlePick = async (helper: HelperCandidate) => {
    setSubmitting(true);
    setError("");

    const title = `${resolvedHelpType} — ${resolvedSubject}`;
    const descriptionWithMeta = [
      values.details,
      values.level ? `Academic level: ${values.level}` : "",
      values.pages
        ? `Expected length: ${values.pages} page${Number(values.pages) === 1 ? "" : "s"} (approx ${(Number(values.pages) || 0) * WORDS_PER_PAGE} words)`
        : "",
      `Country: ${DEFAULT_COUNTRY} (bills in ${defaultCurrencyForCountry(DEFAULT_COUNTRY)})`,
    ]
      .filter(Boolean)
      .join("\n\n");

    const result = await submitRequest({
      title,
      description: descriptionWithMeta || undefined,
      subject: resolvedSubject,
      country: DEFAULT_COUNTRY,
      deadline: values.deadline
        ? new Date(`${values.deadline}T${values.dueTime || LAST_DUE_TIME}:00`).toISOString()
        : null,
      files: values.files,
      helper_id: helper.user_id,
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
            Describe your assignment, then pick the exact helper you want to work with.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <Card className="lg:col-span-2 p-6 md:p-8">
          <div className="flex items-center gap-2 mb-6">
            {["details", "helper"].map((s, i) => {
              const active = step === s;
              return (
                <div key={s} className="flex items-center gap-2">
                  <span
                    className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
                      active ? "bg-primary-container text-on-primary" : "bg-surface-container-high text-on-surface-variant"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span className={`text-sm font-medium ${active ? "text-on-surface" : "text-on-surface-variant"}`}>
                    {s === "details" ? "Assignment Details" : "Choose a Helper"}
                  </span>
                  {i === 0 && <span className="w-8 h-px bg-outline-variant mx-1" />}
                </div>
              );
            })}
          </div>

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
          ) : step === "details" ? (
            <TaskRequestForm
              values={values}
              set={set}
              error={error}
              onSubmit={(e) => {
                e.preventDefault();
                handleContinue();
              }}
              submitLabel="Continue to Choose Helper"
              note="Next you’ll choose a helper. No charge until a bid is accepted."
            />
          ) : (
            <div className="flex flex-col gap-5">
              <div className="rounded-xl border border-outline-variant bg-surface-container-low p-4">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <p className="text-sm font-semibold text-on-surface">Your request</p>
                  <button
                    onClick={() => setStep("details")}
                    className="text-xs text-primary font-medium hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft size={12} /> Edit details
                  </button>
                </div>
                <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-on-surface-variant">
                  <span><strong className="text-on-surface">{resolvedHelpType}</strong></span>
                  <span>{resolvedSubject}</span>
                  {values.level && <span>{values.level}</span>}
                  {values.pages && (
                    <span>
                      {values.pages} page{Number(values.pages) === 1 ? "" : "s"} · approx{" "}
                      {((Number(values.pages) || 0) * WORDS_PER_PAGE).toLocaleString()} words
                    </span>
                  )}
                  {values.deadline && (
                    <span>
                      Due{" "}
                      {new Date(`${values.deadline}T${values.dueTime || LAST_DUE_TIME}:00`).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </span>
                  )}
                  {values.files.length > 0 && <span>{values.files.length} attachment{values.files.length > 1 ? "s" : ""}</span>}
                </div>
              </div>

              {preselectedHelper && (
                <p className="text-xs text-on-surface-variant">
                  You picked a helper from the directory — press{" "}
                  <span className="font-semibold text-on-surface">Send Request</span> on their card to post
                  your request to them.
                </p>
              )}

              <HelperPicker
                subject={resolvedSubject}
                onSelect={handlePick}
                heading={`Helpers for ${resolvedSubject}`}
                preselectedId={preselectedHelper}
              />

              {error && (
                <p className="text-sm text-error bg-error-container/40 border border-error/30 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}
              {submitting && (
                <p className="text-sm text-on-surface-variant inline-flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin text-primary" /> Sending your request to the helper…
                </p>
              )}
            </div>
          )}
        </Card>

        <div className="flex flex-col gap-4">
          <Card className="p-5">
            <h3 className="font-semibold text-sm text-on-surface mb-3 flex items-center gap-2">
              <Info size={15} className="text-primary" />
              Pricing &amp; Timeline
            </h3>
            <div className="space-y-2.5 text-sm">
              {PRICING_BANDS.map((band) => (
                <div key={band.label} className="flex items-center justify-between">
                  <span className="text-on-surface-variant">{band.label}</span>
                  <span className="font-semibold text-on-surface">
                    {formatCurrency(convertCurrency(band.from, "USD", quoteCurrency), quoteCurrency)} –{" "}
                    {formatCurrency(convertCurrency(band.to, "USD", quoteCurrency), quoteCurrency)}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-on-surface-variant mt-3 leading-relaxed">
              Shown in <span className="font-semibold">{quoteCurrency}</span>. Your
              helper responds in the request chat within <span className="font-semibold">2 hours</span> or you can
              choose someone else. Rush orders under 12 hours carry a <span className="font-semibold">+25%</span> premium.
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
                <CheckCircle2 size={13} className="text-success shrink-0 mt-0.5" /> Payments released only after you approve.
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}