"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Upload, Info, CheckCircle2, ShieldCheck, GraduationCap, Loader2, ArrowRight, ArrowLeft } from "lucide-react";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";
import Select from "@/components/ui/select";
import Input from "@/components/ui/input";
import Textarea from "@/components/ui/textarea";
import HelperPicker from "@/components/requests/helper-picker";
import {
  submitRequest, loadPendingDraft, clearPendingDraft, type PendingRequestDraft,
  type HelperCandidate,
} from "@/lib/requests";

const SERVICES = [
  { value: "essay", label: "Essay Writing" },
  { value: "research", label: "Research Help" },
  { value: "problems", label: "Problem Solving" },
  { value: "report", label: "Lab / Project Report" },
  { value: "notes", label: "Summary & Notes" },
  { value: "proofread", label: "Proofreading & Editing" },
];

const SUBJECTS = [
  { value: "history-201", label: "History 201 — American Civilization" },
  { value: "math-320", label: "MATH 320 — Calculus III" },
  { value: "bio-220", label: "BIO 220 — Molecular Biology" },
  { value: "eng-410", label: "ENG 410 — Advanced Composition" },
  { value: "psy-150", label: "PSY 150 — Introduction to Psychology" },
  { value: "other", label: "Other (Community College)" },
];

const DRAFT_DEADLINE_MS: Record<string, number> = {
  "24 hours": 24 * 60 * 60 * 1000,
  "3 days": 3 * 24 * 60 * 60 * 1000,
  "1 week": 7 * 24 * 60 * 60 * 1000,
  "2 weeks": 14 * 24 * 60 * 60 * 1000,
};

function resolveSubjectFromDraft(draftSubject?: string): { value: string; custom: string } {
  if (!draftSubject) return { value: "history-201", custom: "" };
  const needle = draftSubject.toLowerCase();
  const match = SUBJECTS.find(
    (s) => s.label.toLowerCase().includes(needle) || needle.includes(s.label.split("—")[0].trim().toLowerCase())
  );
  if (match) return { value: match.value, custom: "" };
  return { value: "other", custom: draftSubject };
}

function deadlineFromKey(key?: string): string {
  const ms = DRAFT_DEADLINE_MS[key ?? ""];
  if (!ms) return "";
  return new Date(Date.now() + ms).toISOString().slice(0, 10);
}

export default function NewRequestPage() {
  const router = useRouter();
  const [draft] = useState<PendingRequestDraft | null>(() => {
    if (typeof window === "undefined") return null;
    const d = loadPendingDraft();
    if (d) clearPendingDraft();
    return d;
  });
  const [service, setService] = useState(
    () => SERVICES.find((s) => s.label === draft?.service)?.value ?? "essay"
  );
  const resolvedDraftSubject = resolveSubjectFromDraft(draft?.subject);
  const [subject, setSubject] = useState(() => resolvedDraftSubject.value);
  const [customSubject, setCustomSubject] = useState(() => resolvedDraftSubject.custom);
  const [wordCount, setWordCount] = useState(() => draft?.wordCount ?? "");
  const [deadline, setDeadline] = useState(
    () => (draft?.deadlineKey ? deadlineFromKey(draft.deadlineKey) : (draft?.deadline ?? ""))
  );
  const [description, setDescription] = useState(() => draft?.details ?? "");
  const [files, setFiles] = useState<File[]>([]);
  const [completedLevel, setCompletedLevel] = useState(() => draft?.level ?? "");
  const [step, setStep] = useState<"details" | "helper">("details");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (selected: FileList | null) => {
    if (!selected) return;
    setFiles(Array.from(selected));
  };

  const resolvedSubjectLabel =
    subject === "other" && customSubject.trim()
      ? customSubject.trim()
      : (SUBJECTS.find((s) => s.value === subject)?.label ?? subject);

  const handleContinue = () => {
    setError("");
    if (subject === "other" && !customSubject.trim()) {
      setError("Enter the subject or course you need help with.");
      return;
    }
    if (!description.trim() && !wordCount.trim()) {
      setError("Add a short description or a word count so a helper can assess the scope.");
      return;
    }
    setStep("helper");
  };

  const handlePick = async (helper: HelperCandidate) => {
    setSubmitting(true);
    setError("");

    const serviceLabel = SERVICES.find((s) => s.value === service)?.label ?? service;
    const title = `${serviceLabel} — ${resolvedSubjectLabel}`;
    const descriptionWithMeta = [
      description,
      completedLevel ? `Academic level: ${completedLevel}` : "",
      wordCount ? `Expected length: ${wordCount}` : "",
    ]
      .filter(Boolean)
      .join("\n\n");

    const result = await submitRequest({
      title,
      description: descriptionWithMeta || undefined,
      subject: resolvedSubjectLabel,
      deadline: deadline ? new Date(`${deadline}T23:59:59`).toISOString() : null,
      files,
      helper_id: helper.user_id,
    });

    setSubmitting(false);
    if ("error" in result) {
      setError(result.error);
      return;
    }
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

          {step === "details" && (
            <form className="flex flex-col gap-5" onSubmit={(e) => { e.preventDefault(); handleContinue(); }}>
              <Select
                label="Service Type"
                value={service}
                onChange={(e) => setService(e.target.value)}
                options={SERVICES}
              />

              <div className="flex flex-col gap-3">
                <Select
                  label="Subject / Course"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  options={SUBJECTS}
                />
                {subject === "other" && (
                  <Input
                    label="Subject or course name"
                    type="text"
                    placeholder="e.g. Communications 101"
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                  />
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Input
                  label="Pages / Word Count"
                  type="text"
                  placeholder="e.g. 8 pages or 2,000 words"
                  value={wordCount}
                  onChange={(e) => setWordCount(e.target.value)}
                />
                <Input
                  label="Deadline"
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-on-surface">Assignment Description</label>
                <Textarea
                  rows={7}
                  placeholder="Describe the assignment prompt, required format, sources, and any rubric or expectations from your course..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <p className="text-xs text-on-surface-variant">
                  Share the full prompt so your helper can match scope. Never share account credentials.
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-on-surface">Attach Files</label>
                <label className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-outline-variant bg-surface-container-low px-6 py-8 text-center cursor-pointer hover:border-primary-container hover:bg-surface-container-lowest transition-colors">
                  <span className="w-11 h-11 rounded-xl bg-surface-container-lowest border border-outline-variant flex items-center justify-center text-on-surface-variant">
                    <Upload size={20} />
                  </span>
                  <p className="text-sm font-medium text-on-surface">
                    {files.length > 0 ? (
                      <>
                        {files.length} file{files.length > 1 ? "s" : ""} selected —{" "}
                        <span className="text-primary font-semibold">choose more</span>
                      </>
                    ) : (
                      <>
                        Drop files here or <span className="text-primary font-semibold">browse</span>
                      </>
                    )}
                  </p>
                  <p className="text-xs text-on-surface-variant">
                    PDF, DOCX, XLSX up to 25MB each. Prompt PDFs, rubrics, and data sets welcome.
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFiles(e.target.files)}
                  />
                </label>
              </div>

              {error && (
                <p className="text-sm text-error bg-error-container/40 border border-error/30 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-outline-variant">
                <p className="text-xs text-on-surface-variant">
                  Next you&apos;ll choose a helper. No charge until a bid is accepted.
                </p>
                <Button type="submit" size="lg">
                  Continue to Choose Helper <ArrowRight size={16} className="ml-1.5" />
                </Button>
              </div>
            </form>
          )}

          {step === "helper" && (
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
                  <span><strong className="text-on-surface">{SERVICES.find((s) => s.value === service)?.label ?? service}</strong></span>
                  <span>{resolvedSubjectLabel}</span>
                  {wordCount && <span>{wordCount}</span>}
                  {deadline && (
                    <span>
                      Due {new Date(`${deadline}T23:59:59`).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  )}
                  {files.length > 0 && <span>{files.length} attachment{files.length > 1 ? "s" : ""}</span>}
                </div>
              </div>

              <HelperPicker
                subject={resolvedSubjectLabel}
                onSelect={handlePick}
                heading={`Helpers for ${resolvedSubjectLabel}`}
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
              Pricing & Timeline
            </h3>
            <div className="space-y-2.5 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant">Essays (per page)</span>
                <span className="font-semibold text-on-surface">$7 – $15</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant">Problem sets (per set)</span>
                <span className="font-semibold text-on-surface">$35 – $90</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant">Reports (per report)</span>
                <span className="font-semibold text-on-surface">$60 – $160</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant">Research help (per hour)</span>
                <span className="font-semibold text-on-surface">$20 – $40</span>
              </div>
            </div>
            <p className="text-xs text-on-surface-variant mt-3 leading-relaxed">
              Your helper responds in the request chat within <span className="font-semibold">2 hours</span> or you can
              choose someone else. Rush orders under 12 hours carry a <span className="font-semibold">+25%</span> premium.
            </p>
          </Card>

          <Card className="p-5 bg-surface-container-low border border-outline-variant">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck size={16} className="text-success" />
              <h3 className="font-semibold text-sm text-on-surface">Why students trust PeerCraft</h3>
            </div>
            <ul className="space-y-2 text-xs text-on-surface-variant leading-relaxed">
              <li className="flex items-start gap-2">
                <CheckCircle2 size={13} className="text-success shrink-0 mt-0.5" /> Subject-matter experts verified against university records.
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={13} className="text-success shrink-0 mt-0.5" /> 100% originality checks on every delivered draft.
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={13} className="text-success shrink-0 mt-0.5" /> Escrow payments released only after you approve.
              </li>
            </ul>
          </Card>

          <Card className="p-5 flex items-start gap-3 bg-primary-fixed border border-outline-variant">
            <GraduationCap size={18} className="text-primary shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-sm text-on-surface">Reminder: Honor Code</h3>
              <p className="text-xs leading-relaxed text-on-surface-variant mt-1">
                Use deliverables as study aids and reference material. Don&apos;t submit helper work as your own —
                your Academic Honor Pass depends on it.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}