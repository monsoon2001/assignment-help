"use client";

import { useActionState } from "react";
import Button from "@/components/ui/button";
import { resendEmail, type ActionResult } from "@/app/admin/actions";

export default function ResendEmailButton({ id }: { id: string }) {
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(resendEmail, {
    ok: false,
    message: "",
  });

  return (
    <form action={formAction} className="flex flex-col items-end gap-1">
      <input type="hidden" name="id" value={id} />
      <Button size="sm" variant="secondary" type="submit" disabled={pending}>
        {pending ? "Resending..." : "Resend"}
      </Button>
      {state.message && (
        <span className={`text-xs ${state.ok ? "text-success" : "text-error"}`}>
          {state.message}
        </span>
      )}
    </form>
  );
}