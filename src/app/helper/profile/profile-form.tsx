"use client";

import { useState } from "react";
import { useActionState } from "react";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Textarea from "@/components/ui/textarea";
import Avatar from "@/components/ui/avatar";
import { Save, Mail, ShieldCheck, DollarSign, UserRound } from "lucide-react";
import { saveHelperProfile, type HelperProfileResult } from "./actions";

export default function HelperProfile({
  name = "",
  avatarUrl = null,
  firstName = "",
  lastName = "",
  email = "",
  hourlyRate = 20,
  initialBio = "",
}: {
  name?: string;
  avatarUrl?: string | null;
  firstName?: string;
  lastName?: string;
  email?: string;
  hourlyRate?: number;
  initialBio?: string;
}) {
  const [state, formAction, pending] = useActionState<HelperProfileResult, FormData>(
    saveHelperProfile,
    { ok: false, message: "" },
  );

  const [bio, setBio] = useState(initialBio);
  const displayName = name || `${firstName} ${lastName}`.trim() || "Acadivo Helper";

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-5">
      <div>
        <h1 className="font-display font-bold text-xl sm:text-2xl text-on-surface">Profile</h1>
        <p className="text-sm text-on-surface-variant mt-0.5">
          Manage the details on your helper profile.
        </p>
      </div>

      <Card className="p-4 sm:p-5">
        <div className="flex items-center gap-4 sm:gap-5">
          <div className="flex flex-col items-center gap-1.5 shrink-0">
            <Avatar name={displayName} role="helper" size="xl" src={avatarUrl ?? undefined} />
            <button type="button" className="text-xs font-medium text-primary hover:underline">
              Change photo
            </button>
          </div>
          <div className="min-w-0">
            <h2 className="font-display font-semibold text-lg text-on-surface truncate">
              {displayName}
            </h2>
            <p className="text-sm text-on-surface-variant truncate">{email || "—"}</p>
            <p className="text-xs text-on-surface-variant mt-1">Helper profile</p>
          </div>
        </div>
      </Card>

      <form action={formAction} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="p-4 sm:p-5">
            <h3 className="font-display font-semibold text-on-surface mb-1">Personal info</h3>
            <p className="text-xs text-on-surface-variant mb-4">
              Your name as shown to students in your workspace.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input name="firstName" label="First Name" defaultValue={firstName} required />
              <Input name="lastName" label="Last Name" defaultValue={lastName} />
            </div>
          </Card>

          <Card className="p-4 sm:p-5">
            <h3 className="font-display font-semibold text-on-surface mb-1">Contact</h3>
            <p className="text-xs text-on-surface-variant mb-4">Your account contact details.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 flex flex-col gap-1.5">
                <label className="text-sm font-medium text-on-surface">Email</label>
                <div className="w-full h-11 flex items-center px-3.5 gap-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface-variant">
                  <Mail size={16} className="shrink-0 text-on-surface-variant" />
                  <span className="truncate">{email || "—"}</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-4 sm:p-5 lg:col-span-2">
            <h3 className="font-display font-semibold text-on-surface mb-1">Helper details</h3>
            <p className="text-xs text-on-surface-variant mb-4">
              Set your rate and introduce yourself to students.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                name="hourlyRate"
                label="Hourly Rate ($)"
                defaultValue={String(hourlyRate)}
                type="number"
                min={0}
                step="0.01"
              />
              <div className="hidden sm:block" />
              <div className="sm:col-span-2">
                <Textarea
                  name="bio"
                  label="Bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  placeholder="Introduce yourself to students. Tell them what you help with and how you work."
                />
              </div>
            </div>
          </Card>

          <Card className="p-4 sm:p-5 lg:col-span-2">
            <h3 className="font-display font-semibold text-on-surface mb-1">Security</h3>
            <p className="text-xs text-on-surface-variant mb-4">Your account and profile status.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-3 p-3 rounded-lg border border-outline-variant bg-surface-container-low/40">
                <span className="w-9 h-9 rounded-lg bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0">
                  <ShieldCheck size={16} />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-on-surface">Sign-in method</p>
                  <p className="text-xs text-on-surface-variant">Managed via your account login</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg border border-outline-variant bg-surface-container-low/40">
                <span className="w-9 h-9 rounded-lg bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0">
                  <DollarSign size={16} />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-on-surface">Hourly rate</p>
                  <p className="text-xs text-on-surface-variant">${hourlyRate}/hr (profile default)</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg border border-outline-variant bg-surface-container-low/40 sm:col-span-2">
                <span className="w-9 h-9 rounded-lg bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0">
                  <UserRound size={16} />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-on-surface">Profile identity</p>
                  <p className="text-xs text-on-surface-variant truncate">{displayName} · {email || "—"}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {state.message && (
          <p
            className={`text-sm rounded-lg px-3 py-2 ${state.ok ? "text-success bg-success-tint" : "text-error bg-error-container/30"}`}
          >
            {state.message}
          </p>
        )}

        <div className="sticky bottom-20 md:bottom-4 z-10 flex justify-end pt-1">
          <Button type="submit" disabled={pending} className="shadow-sm">
            <Save size={16} />
            {pending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
