"use client";

import { useActionState } from "react";
import { GraduationCap, Mail } from "lucide-react";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { saveAdminProfile, type AdminProfileResult } from "./actions";

export default function AdminProfileForm({
  firstName = "",
  lastName = "",
  email = "",
}: {
  firstName?: string;
  lastName?: string;
  email?: string;
}) {
  const [state, formAction, pending] = useActionState<AdminProfileResult, FormData>(
    saveAdminProfile,
    { ok: false, message: "" },
  );

  return (
    <Card className="p-6">
      <form action={formAction}>
        <h3 className="font-display font-semibold text-on-surface mb-1">Account Information</h3>
        <p className="text-xs text-on-surface-variant mb-5">
          Your identity is verified. Email cannot be changed.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input name="firstName" label="First Name" defaultValue={firstName} required />
          <Input name="lastName" label="Last Name" defaultValue={lastName} />
          <div className="sm:col-span-2 flex flex-col gap-1.5">
            <label className="text-sm font-medium text-on-surface">Email</label>
            <div className="w-full h-11 flex items-center px-3.5 gap-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface-variant">
              <Mail size={16} className="shrink-0 text-on-surface-variant" />
              <span className="truncate">{email || "—"}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-5 pt-5 border-t border-outline-variant">
          <GraduationCap size={15} className="text-primary shrink-0" />
          <p className="text-xs text-on-surface-variant">
            Admin credentials are provisioned by the platform team. Contact your setup owner for any
            account changes.
          </p>
        </div>
        {state.message && (
          <p
            className={`mt-4 text-sm rounded-lg px-3 py-2 ${state.ok ? "text-success bg-success-tint" : "text-error bg-error-container/30"}`}
          >
            {state.message}
          </p>
        )}
        <Button type="submit" disabled={pending} className="mt-4">
          {pending ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </Card>
  );
}
