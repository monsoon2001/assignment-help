"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { savePendingDraft, saveDraftFiles } from "@/lib/requests";
import { SUBJECTS, SERVICE_TYPES, ACADEMIC_LEVELS, OTHER_OPTION, composeSelection } from "@/lib/constants";

const SUBJECT_OPTIONS = [...SUBJECTS, OTHER_OPTION];
const HELP_TYPE_OPTIONS = [...SERVICE_TYPES, OTHER_OPTION];

export default function PriceEstimateForm() {
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [customSubject, setCustomSubject] = useState("");
  const [helpType, setHelpType] = useState("");
  const [customHelpType, setCustomHelpType] = useState("");
  const [level, setLevel] = useState("");
  const [deadline, setDeadline] = useState("");
  const [wordCount, setWordCount] = useState("");
  const [details, setDetails] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState("");

  const handleFiles = (selected: FileList | null) => {
    if (!selected) return;
    setFiles(Array.from(selected));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const subjectRaw = composeSelection(subject, subject === OTHER_OPTION, customSubject);
    const helpTypeRaw = composeSelection(helpType, helpType === OTHER_OPTION, customHelpType);

    if (!subjectRaw) {
      setError("Please select a subject.");
      return;
    }
    if (!helpTypeRaw) {
      setError("Please select the type of help you need.");
      return;
    }
    if (!level) {
      setError("Please select your academic level.");
      return;
    }
    if (!deadline) {
      setError("Please choose a deadline.");
      return;
    }
    if (!wordCount.trim() && !details.trim()) {
      setError("Add a word count or a short description so a helper can assess the scope.");
      return;
    }

    savePendingDraft({
      service: helpTypeRaw,
      subject: subjectRaw,
      level,
      deadline,
      wordCount,
      details,
    });
    await saveDraftFiles(files);

    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      router.push("/sign-in?next=/requests/new");
      return;
    }
    router.push("/requests/new");
  };

  const today = new Date().toISOString().slice(0, 10);

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-on-surface">Subject</label>
          <select
            value={subject}
            onChange={(e) => {
              setSubject(e.target.value);
              setError("");
            }}
            className="w-full h-11 px-3.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all appearance-none cursor-pointer"
          >
            <option value="">Select subject</option>
            {SUBJECT_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {subject === OTHER_OPTION && (
            <input
              type="text"
              placeholder="Type your subject, e.g. Music Theory"
              value={customSubject}
              onChange={(e) => setCustomSubject(e.target.value)}
              className="w-full h-11 px-3.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all"
            />
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-on-surface">Type of Help</label>
          <select
            value={helpType}
            onChange={(e) => {
              setHelpType(e.target.value);
              setError("");
            }}
            className="w-full h-11 px-3.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all appearance-none cursor-pointer"
          >
            <option value="">Select type</option>
            {HELP_TYPE_OPTIONS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          {helpType === OTHER_OPTION && (
            <input
              type="text"
              placeholder="Type the help you need, e.g. Lab Report"
              value={customHelpType}
              onChange={(e) => setCustomHelpType(e.target.value)}
              className="w-full h-11 px-3.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all"
            />
          )}
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-on-surface">Academic Level</label>
        <select
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          className="w-full h-11 px-3.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all appearance-none cursor-pointer"
        >
          <option value="">Select level</option>
          {ACADEMIC_LEVELS.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-on-surface">Deadline</label>
          <input
            type="date"
            min={today}
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full h-11 px-3.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-on-surface">Word Count</label>
          <input
            type="text"
            placeholder="e.g. 1500"
            value={wordCount}
            onChange={(e) => setWordCount(e.target.value)}
            className="w-full h-11 px-3.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all"
          />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-on-surface">Assignment Details</label>
        <textarea
          placeholder="Describe your assignment, topic, requirements, and any specific instructions..."
          rows={3}
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          className="w-full p-3.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all resize-none"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-on-surface">Attachments</label>
        <label className="flex items-center justify-center gap-2 w-full py-6 border-2 border-dashed border-outline-variant rounded-xl cursor-pointer hover:border-primary-container hover:bg-primary-container/5 transition-all text-on-surface-variant">
          <Upload className="w-5 h-5" />
          <span className="text-sm font-medium">
            {files.length > 0
              ? `${files.length} file${files.length > 1 ? "s" : ""} attached`
              : "Upload files (PDF, DOCX, images)"}
          </span>
          <input type="file" className="hidden" multiple accept=".pdf,.docx,.doc,.png,.jpg,.jpeg" onChange={(e) => handleFiles(e.target.files)} />
        </label>
      </div>
      {error && (
        <p className="text-sm text-error bg-error-container/40 border border-error/30 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
      <button
        type="submit"
        className="w-full h-12 bg-primary-container text-on-primary rounded-xl font-semibold text-sm hover:bg-primary transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
      >
        Get Price Estimate
        <ArrowRight className="w-4 h-4" />
      </button>
      <p className="text-xs text-on-surface-variant text-center">
        Free estimate — no commitment required
      </p>
    </form>
  );
}