"use client";

import { useActionState } from "react";
import Button from "@/components/ui/button";
import { requestRefund, type ActionResult } from "@/app/admin/actions";

export default function RefundButton({ paymentId }: { paymentId: string }) {
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(requestRefund, {
    ok: false,
    message: "",
  });

  return (
    <form action={formAction} className="flex flex-col items-end gap-1">
      <input type="hidden" name="paymentId" value={paymentId} />
      <Button size="sm" variant="danger" type="submit" disabled={pending}>
        {pending ? "Refunding..." : "Refund"}
      </Button>
      {state.message && (
        <span className={`text-[11px] ${state.ok ? "text-success" : "text-error"}`}>{state.message}</span>
      )}
    </form>
  );
}