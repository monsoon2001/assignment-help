"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { savePendingDraft } from "@/lib/requests";

const SUBJECTS = [
  "English Literature",
  "Mathematics",
  "Biology",
  "Chemistry",
  "Physics",
  "Computer Science",
  "History",
  "Business Studies",
];

const HELP_TYPES = [
  "Essay Writing",
  "Report Writing",
  "Homework Help",
  "Project Guidance",
  "Editing & Proofreading",
  "Tutoring",
];

const LEVELS = ["High School", "Undergraduate", "Graduate", "Postgraduate"];

const DEADLINE_KEYS = ["24 hours", "3 days", "1 week", "2 weeks"];

export default function PriceEstimateForm() {
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [helpType, setHelpType] = useState("");
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

    if (!subject || !helpType || !level || !deadline) {
      setError("Please fill in subject, type of help, academic level, and deadline.");
      return;
    }

    savePendingDraft({
      service: helpType,
      subject,
      level,
      deadlineKey: deadline,
      wordCount,
      details,
    });

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

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-on-surface">Subject</label>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full h-11 px-3.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all appearance-none cursor-pointer"
          >
            <option value="">Select subject</option>
            {SUBJECTS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-on-surface">Type of Help</label>
          <select
            value={helpType}
            onChange={(e) => setHelpType(e.target.value)}
            className="w-full h-11 px-3.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all appearance-none cursor-pointer"
          >
            <option value="">Select type</option>
            {HELP_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
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
          {LEVELS.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-on-surface">Deadline</label>
          <select
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full h-11 px-3.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all appearance-none cursor-pointer"
          >
            <option value="">Select deadline</option>
            {DEADLINE_KEYS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
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