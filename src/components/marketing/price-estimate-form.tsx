"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import TaskRequestForm, {
  LAST_DUE_TIME,
  normalizePages,
  WORDS_PER_PAGE,
  type TaskRequestField,
  type TaskRequestFormValues,
} from "@/components/requests/task-request-form";
import { createClient } from "@/lib/supabase/client";
import {
  savePendingDraft,
  saveDraftFiles,
  loadPendingDraft,
  submitRequest,
  clearPendingDraft,
  clearDraftFiles,
} from "@/lib/requests";
import { OTHER_OPTION, composeSelection } from "@/lib/constants";
import { countryNameFor, defaultCurrencyForCountry, DEFAULT_COUNTRY } from "@/lib/currency";

const BLANK: TaskRequestFormValues = {
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
};

export default function PriceEstimateForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [values, setValues] = useState<TaskRequestFormValues>(BLANK);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const restoredRef = useRef(false);

  const set = useCallback(<K extends TaskRequestField>(key: K, value: TaskRequestFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setError("");
  }, []);

  // If the user was redirected back here after sign-in (?draft=1), restore the draft
  useEffect(() => {
    if (restoredRef.current) return;
    if (searchParams.get("draft") !== "1") return;
    restoredRef.current = true;
    queueMicrotask(() => {
      const draft = loadPendingDraft();
      if (!draft) return;
      setValues({
        subject: draft.subject ?? BLANK.subject,
        helpType: draft.service ?? BLANK.helpType,
        level: draft.level ?? BLANK.level,
        deadline: draft.deadlineKey ?? draft.deadline ?? BLANK.deadline,
        dueTime: draft.dueTime || BLANK.dueTime,
        pages: normalizePages(draft.wordCount),
        details: draft.details ?? BLANK.details,
        customSubject: BLANK.customSubject,
        customHelpType: BLANK.customHelpType,
        files: BLANK.files,
      });
      // Remove the ?draft=1 param from the URL without a reload
      const url = new URL(window.location.href);
      url.searchParams.delete("draft");
      window.history.replaceState({}, "", url.toString());
    });
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!termsAccepted) {
      setError("Please accept the Terms of Service before continuing.");
      return;
    }

    const subjectRaw = composeSelection(
      values.subject,
      values.subject === OTHER_OPTION,
      values.customSubject,
    );
    const helpTypeRaw = composeSelection(
      values.helpType,
      values.helpType === OTHER_OPTION,
      values.customHelpType,
    );

    if (!subjectRaw) {
      setError("Please select a subject.");
      return;
    }
    if (!helpTypeRaw) {
      setError("Please select the type of help you need.");
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
    if (!values.pages.trim() && !values.details.trim()) {
      setError("Add the page count or a short description so a helper can assess the scope.");
      return;
    }

    setSubmitting(true);
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        savePendingDraft({
          service: helpTypeRaw,
          subject: subjectRaw,
          level: values.level,
          deadline: values.deadline,
          dueTime: values.dueTime || undefined,
          wordCount: values.pages,
          details: values.details,
        });
        await saveDraftFiles(values.files);
        router.push("/sign-in?next=/requests/new");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("country")
        .eq("id", session.user.id)
        .maybeSingle();
      if (profileError) {
        console.error("homepage request submission: profile country lookup failed", profileError);
        setError("We couldn't verify your billing country. Please try again.");
        return;
      }
      const country = countryNameFor(profile?.country) ?? DEFAULT_COUNTRY;
      const description = [
        values.details,
        `Academic level: ${values.level}`,
        values.pages
          ? `Expected length: ${values.pages} page${Number(values.pages) === 1 ? "" : "s"} (approx ${Number(values.pages) * WORDS_PER_PAGE} words)`
          : "",
        `Country: ${country} (bills in ${defaultCurrencyForCountry(country)})`,
      ]
        .filter(Boolean)
        .join("\n\n");
      const result = await submitRequest({
        title: `${helpTypeRaw} — ${subjectRaw}`,
        description,
        subject: subjectRaw,
        country,
        deadline: values.deadline
          ? new Date(`${values.deadline}T${values.dueTime || LAST_DUE_TIME}:00`).toISOString()
          : null,
        files: values.files,
      });

      if ("error" in result) {
        setError(result.error);
        return;
      }

      clearPendingDraft();
      await clearDraftFiles();
      router.push(`/requests/sent?id=${result.id}`);
    } catch (submitError) {
      console.error("homepage request submission failed", submitError);
      setError("We couldn't send your request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <TaskRequestForm
      values={values}
      set={set}
      error={error}
      onSubmit={handleSubmit}
      termsAccepted={termsAccepted}
      setTermsAccepted={setTermsAccepted}
      submitLabel="Get My Estimate"
      submitVariant="brand"
      note="Free estimate — no commitment required"
      submitting={submitting}
    />
  );
}
