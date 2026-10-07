"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, CalendarDays, Clock, ChevronUp, ChevronDown, FileText, Loader2, Trash2, Upload, X } from "lucide-react";
import { SUBJECTS, SERVICE_TYPES, ACADEMIC_LEVELS, OTHER_OPTION } from "@/lib/constants";
import Input from "@/components/ui/input";
import Select from "@/components/ui/select";
import Textarea from "@/components/ui/textarea";
import Button from "@/components/ui/button";

export const SUBJECT_OPTIONS = [...SUBJECTS, OTHER_OPTION];
export const HELP_TYPE_OPTIONS = [...SERVICE_TYPES, OTHER_OPTION];
export const LEVEL_OPTIONS = [...ACADEMIC_LEVELS];

const FIELD_CLASS =
  "w-full h-10 px-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all";
// Safari renders native date/time widgets tiny and hides the time value when it
// is empty, so these fields are styled as plain inputs and open the picker from
// their own icon button.
const PICKER_CLASS =
  `${FIELD_CLASS} h-11 text-base appearance-none pr-10 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-date-and-time-value]:w-full [&::-webkit-date-and-time-value]:text-left`;
export const LAST_DUE_TIME = "23:59";
export const WORDS_PER_PAGE = 250;

/** Keeps only the page count out of a stored/legacy "5 pages (approx 1250 words)" value. */
export function normalizePages(value?: string): string {
  const match = /\d+/.exec(value ?? "");
  return match ? match[0] : "";
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export interface TaskRequestFormValues {
  subject: string;
  customSubject: string;
  helpType: string;
  customHelpType: string;
  level: string;
  deadline: string;
  dueTime: string;
  pages: string;
  details: string;
  files: File[];
}

export type TaskRequestField =
  | "subject"
  | "customSubject"
  | "helpType"
  | "customHelpType"
  | "level"
  | "deadline"
  | "dueTime"
  | "pages"
  | "details"
  | "files";

interface TaskRequestFormProps {
  values: TaskRequestFormValues;
  set: <K extends TaskRequestField>(key: K, value: TaskRequestFormValues[K]) => void;
  error?: string;
  onSubmit: (e: React.FormEvent) => void;
  submitLabel: string;
  note?: string;
  submitting?: boolean;
}

/**
 * A date or time input that stays readable in Safari: the native widget is
 * hidden behind an icon button that opens the real picker, so the value is
 * always visible instead of collapsing to a tiny segmented control.
 */
function PickerField({
  label,
  kind,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  kind: "date" | "time";
  value: string;
  min?: string;
  max?: string;
  onChange: (value: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const Icon = kind === "date" ? CalendarDays : Clock;

  const openPicker = () => {
    const input = inputRef.current;
    if (!input) return;
    if (typeof input.showPicker === "function") {
      try {
        input.showPicker();
        return;
      } catch {
        // Safari rejects showPicker in some states; focusing still opens it.
      }
    }
    input.focus();
    input.click();
  };

  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-on-surface" htmlFor={`field-${kind}`}>
        {label}
      </label>
      <div className="relative flex items-center">
        <input
          id={`field-${kind}`}
          ref={inputRef}
          type={kind}
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={PICKER_CLASS}
        />
        <button
          type="button"
          onClick={openPicker}
          aria-label={`Open ${label.toLowerCase()} picker`}
          className="absolute right-3 flex items-center text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
        >
          <Icon size={16} />
        </button>
      </div>
    </div>
  );
}

/**
 * The single request form shared by the homepage estimate section and the
 * student request wizard, so both capture exactly the same details in the
 * same order and look identical.
 */
export default function TaskRequestForm({
  values,
  set,
  error,
  onSubmit,
  submitLabel,
  note,
  submitting = false,
}: TaskRequestFormProps) {
  const today = new Date().toISOString().slice(0, 10);
  const [filesOpen, setFilesOpen] = useState(false);
  const [pagesEditing, setPagesEditing] = useState(false);
  const pagesInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Picking files again adds to the list instead of replacing it.
  const handleFiles = (selected: FileList | null) => {
    if (!selected?.length) return;
    const merged = [...values.files];
    for (const file of Array.from(selected)) {
      const duplicate = merged.some(
        (existing) =>
          existing.name === file.name &&
          existing.size === file.size &&
          existing.lastModified === file.lastModified
      );
      if (!duplicate) merged.push(file);
    }
    set("files", merged);
  };

  const removeFile = (index: number) => {
    set("files", values.files.filter((_, i) => i !== index));
  };

  useEffect(() => {
    if (!filesOpen) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setFilesOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [filesOpen]);

  const pages = Number(values.pages || "0");
  const wordEstimate = pages > 0 ? pages * WORDS_PER_PAGE : 0;
  // The field reads "2 pages - approx 500 words" until it is clicked, then it
  // turns into a plain number input for editing.
  const pagesLabel =
    pages > 0
      ? `${pages} page${pages === 1 ? "" : "s"} \u00b7 approx ${wordEstimate.toLocaleString()} words`
      : "";

  // One page is roughly WORDS_PER_PAGE words, so each step is +/-1 page and
  // +/-WORDS_PER_PAGE words.
  const stepPages = (delta: number) => {
    const current = Number(values.pages || "0");
    const base = Number.isFinite(current) ? current : 0;
    set("pages", String(Math.max(0, base + delta)));
  };

  // 11:59 PM is the latest selectable due time.
  const handleDueTime = (value: string) => {
    set("dueTime", value && value > LAST_DUE_TIME ? LAST_DUE_TIME : value);
  };

  return (
    <form className="space-y-3" onSubmit={onSubmit}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <Select
            label="What subject?"
            value={values.subject}
            onChange={(e) => set("subject", e.target.value)}
            placeholder="Select subject"
            options={SUBJECT_OPTIONS.map((s) => ({ value: s, label: s }))}
          />
          {values.subject === OTHER_OPTION && (
            <Input
              type="text"
              placeholder="Type your subject, e.g. Music Theory"
              value={values.customSubject}
              onChange={(e) => set("customSubject", e.target.value)}
            />
          )}
        </div>
        <div className="flex flex-col gap-1">
          <Select
            label="What are you working on?"
            value={values.helpType}
            onChange={(e) => set("helpType", e.target.value)}
            placeholder="Select type"
            options={HELP_TYPE_OPTIONS.map((t) => ({ value: t, label: t }))}
          />
          {values.helpType === OTHER_OPTION && (
            <Input
              type="text"
              placeholder="Type the help you need, e.g. Lab Report"
              value={values.customHelpType}
              onChange={(e) => set("customHelpType", e.target.value)}
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <Select
            label="Academic level"
            value={values.level}
            onChange={(e) => set("level", e.target.value)}
            placeholder="Select level"
            options={LEVEL_OPTIONS.map((l) => ({ value: l, label: l }))}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-on-surface">Pages / words</label>
          <div className="relative flex items-center">
            <input
              ref={pagesInputRef}
              type={pagesEditing ? "number" : "text"}
              inputMode={pagesEditing ? "numeric" : undefined}
              min={0}
              step={1}
              readOnly={!pagesEditing}
              placeholder="1 page / 250 words approx"
              value={pagesEditing ? values.pages : pagesLabel}
              onFocus={() => {
                setPagesEditing(true);
                requestAnimationFrame(() => pagesInputRef.current?.select());
              }}
              onBlur={() => setPagesEditing(false)}
              onChange={(e) => set("pages", e.target.value)}
              className={`${FIELD_CLASS} pr-9 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
            />
            <span className="absolute right-1 flex flex-col gap-0.5">
              <button
                type="button"
                onClick={() => stepPages(1)}
                aria-label="Add one page (250 words)"
                className="w-6 h-4 flex items-center justify-center rounded text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors cursor-pointer"
              >
                <ChevronUp size={14} />
              </button>
              <button
                type="button"
                onClick={() => stepPages(-1)}
                disabled={pages <= 0}
                aria-label="Remove one page (250 words)"
                className="w-6 h-4 flex items-center justify-center rounded text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
              >
                <ChevronDown size={14} />
              </button>
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <PickerField
          label="When is it due?"
          kind="date"
          value={values.deadline}
          min={today}
          onChange={(value) => set("deadline", value)}
        />
        <PickerField
          label="Due time"
          kind="time"
          value={values.dueTime}
          max={LAST_DUE_TIME}
          onChange={handleDueTime}
        />
      </div>

      <Textarea
        label="Tell us about your assignment"
        rows={3}
        placeholder="Describe what you need help with..."
        value={values.details}
        onChange={(e) => set("details", e.target.value)}
      />

      <div className="flex flex-col gap-1">
        <span className="text-xs font-semibold text-on-surface">Files</span>
        {values.files.length > 0 ? (
          <button
            type="button"
            onClick={() => setFilesOpen(true)}
            className="flex items-center justify-center gap-2 w-full py-2 border border-dashed border-primary-container/50 bg-primary-container/5 rounded-xl text-on-surface-variant hover:border-primary-container hover:bg-primary-container/10 transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span className="text-sm font-medium">
              {values.files.length} file{values.files.length > 1 ? "s" : ""} attached — click to review
            </span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2 w-full py-2 border border-dashed border-outline-variant rounded-xl text-on-surface-variant hover:border-primary-container hover:bg-primary-container/5 transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span className="text-sm font-medium">+ Upload assignment instructions</span>
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          multiple
          accept=".pdf,.docx,.doc,.png,.jpg,.jpeg"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {error && (
        <p className="text-sm text-error bg-error-container/40 border border-error/30 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <Button
        type="submit"
        disabled={submitting}
        className="w-full h-11"
      >
        {submitting ? <Loader2 size={16} className="animate-spin" /> : submitLabel}
        {submitting ? <span className="sr-only">Submitting</span> : <ArrowRight className="w-4 h-4" />}
      </Button>

      {note && <p className="text-xs text-on-surface-variant text-center">{note}</p>}

      {filesOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/40 animate-[dialog-in_0.2s_ease-out]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="attached-files-title"
            onClick={() => setFilesOpen(false)}
          >
            <div
              className="w-full max-w-md max-h-[80vh] overflow-y-auto bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3
                    id="attached-files-title"
                    className="font-display font-bold text-lg text-on-surface"
                  >
                    Attached files
                  </h3>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    {values.files.length} file{values.files.length === 1 ? "" : "s"} ready to send with your
                    request. Remove anything you picked by mistake.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setFilesOpen(false)}
                  aria-label="Close attached files"
                  className="w-8 h-8 rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface flex items-center justify-center cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {values.files.length === 0 ? (
                <p className="text-sm text-on-surface-variant text-center py-8">
                  No files attached yet.
                </p>
              ) : (
                <ul className="mt-4 divide-y divide-outline-variant/40 border-y border-outline-variant/40">
                  {values.files.map((file, index) => (
                    <li key={`${file.name}-${file.size}-${file.lastModified}`} className="flex items-center gap-3 py-2.5">
                      <span className="w-9 h-9 rounded-lg bg-surface-container-low border border-outline-variant flex items-center justify-center text-on-surface-variant shrink-0">
                        <FileText size={16} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium text-on-surface truncate">
                          {file.name}
                        </span>
                        <span className="block text-xs text-on-surface-variant">
                          {formatFileSize(file.size)}
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        aria-label={`Remove ${file.name}`}
                        className="w-8 h-8 rounded-lg text-on-surface-variant hover:bg-error-container/40 hover:text-error flex items-center justify-center cursor-pointer transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-5 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-on-surface border border-outline-variant bg-surface-container-lowest hover:bg-surface-container-low transition-colors cursor-pointer"
                >
                  <Upload size={16} />
                  Add more files
                </button>
                <button
                  type="button"
                  onClick={() => setFilesOpen(false)}
                  className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium bg-primary-container text-on-primary hover:bg-primary transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </form>
  );
}