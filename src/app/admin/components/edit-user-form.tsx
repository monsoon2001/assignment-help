"use client";

import { useActionState } from "react";
import Link from "next/link";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Select from "@/components/ui/select";
import { updateUser, type ActionResult } from "@/app/admin/actions";

export default function EditUserForm({
  user,
  listPath,
}: {
  user: { id: string; name: string | null; role: string; status: string };
  listPath: "students" | "helpers";
}) {
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(updateUser, {
    ok: false,
    message: "",
  });

  return (
    <Card className="p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-lg font-semibold text-on-surface">Edit user</h2>
        <Link href={`/admin/${listPath}`} className="text-sm text-on-surface-variant hover:text-on-surface">
          Close
        </Link>
      </div>
      <form className="flex flex-col gap-4" action={formAction}>
        <input type="hidden" name="userId" value={user.id} />
        <Input label="Full name" name="name" defaultValue={user.name ?? ""} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            name="role"
            label="Role"
            defaultValue={user.role}
            options={[
              { value: "student", label: "Student" },
              { value: "helper", label: "Helper" },
              { value: "admin", label: "Admin" },
            ]}
          />
          <Select
            name="status"
            label="Status"
            defaultValue={user.status}
            options={[
              { value: "active", label: "Active" },
              { value: "suspended", label: "Suspended" },
              { value: "pending", label: "Pending" },
            ]}
          />
        </div>
        {state.message && (
          <p className={`text-sm rounded-lg px-3 py-2 ${state.ok ? "text-success bg-emerald-50" : "text-error bg-error-container/30"}`}>
            {state.message}
          </p>
        )}
        <div className="flex justify-end">
          <Button type="submit" disabled={pending}>
            {pending ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </form>
    </Card>
  );
}