"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import TaskRequestForm, {
  LAST_DUE_TIME,
  normalizePages,
  type TaskRequestField,
  type TaskRequestFormValues,
} from "@/components/requests/task-request-form";
import { createClient } from "@/lib/supabase/client";
import { savePendingDraft, saveDraftFiles, loadPendingDraft } from "@/lib/requests";
import { OTHER_OPTION, composeSelection } from "@/lib/constants";

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
  const restoredRef = useRef(false);

  const set = useCallback(<K extends TaskRequestField>(
    key: K,
    value: TaskRequestFormValues[K]
  ) => {
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

    const subjectRaw = composeSelection(
      values.subject,
      values.subject === OTHER_OPTION,
      values.customSubject
    );
    const helpTypeRaw = composeSelection(
      values.helpType,
      values.helpType === OTHER_OPTION,
      values.customHelpType
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
      setError("Add pages/words or a short description so a helper can assess the scope.");
      return;
    }

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

    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    // The draft (fields + files) is already saved, so anonymous visitors resume
    // straight on the request page once they have an account.
    if (!session) {
      router.push("/sign-in?next=/requests/new");
      return;
    }
    router.push("/requests/new");
  };

  return (
    <TaskRequestForm
      values={values}
      set={set}
      error={error}
      onSubmit={handleSubmit}
      submitLabel="Find Matching Helpers"
      note="Free estimate — no commitment required"
    />
  );
}