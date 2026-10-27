"use client";

import { useRef } from "react";
import { setActiveHelper } from "@/app/admin/actions";

/**
 * Radio control in the helpers table for choosing the single helper that every
 * new student request is routed to. Selecting a row submits the server action.
 */
export default function ActiveHelperRadio({
  helperId,
  active,
}: {
  helperId: string;
  active: boolean;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form action={setActiveHelper} ref={formRef}>
      <input type="hidden" name="helperId" value={helperId} />
      <label className="inline-flex items-center gap-2 cursor-pointer select-none">
        <input
          type="radio"
          name="active-helper"
          className="h-4 w-4 accent-[var(--color-primary,#2563EB)]"
          checked={active}
          disabled={active}
          onChange={() => formRef.current?.requestSubmit()}
        />
        <span
          className={
            active ? "text-sm font-semibold text-primary" : "text-sm text-on-surface-variant"
          }
        >
          {active ? "Main helper" : "Make main"}
        </span>
      </label>
    </form>
  );
}
