"use client";

import { useActionState } from "react";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Select from "@/components/ui/select";
import Avatar from "@/components/ui/avatar";
import { Save, Mail, GraduationCap, BookOpen, ShieldCheck } from "lucide-react";
import { COUNTRY_OPTIONS } from "@/lib/currency";
import { saveStudentProfile, type StudentProfileResult } from "./actions";

const LEVELS = [
  "High School",
  "Undergraduate",
  "Postgraduate",
  "Doctorate",
  "Vocational / Diploma",
  "Continuing Education",
  "Other",
];

export default function StudentProfileForm({
  name = "",
  email = "",
  avatarUrl = null,
  firstName = "",
  lastName = "",
  institution = "",
  levelOfStudy = "",
  country = "",
  memberSince = null,
}: {
  name?: string;
  email?: string;
  avatarUrl?: string | null;
  firstName?: string;
  lastName?: string;
  institution?: string;
  levelOfStudy?: string;
  country?: string;
  memberSince?: number | null;
}) {
  const [state, formAction, pending] = useActionState<StudentProfileResult, FormData>(
    saveStudentProfile,
    { ok: false, message: "" },
  );

  const displayName = name || (email ? email.split("@")[0] : "Acadivo Student");

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-5">
      <div>
        <h1 className="font-display font-bold text-xl sm:text-2xl text-on-surface">Profile</h1>
        <p className="text-sm text-on-surface-variant mt-0.5">
          Manage your personal details and account settings.
        </p>
      </div>

      <Card className="p-4 sm:p-5">
        <div className="flex items-center gap-4 sm:gap-5">
          <div className="flex flex-col items-center gap-1.5 shrink-0">
            <Avatar name={displayName} size="xl" src={avatarUrl ?? undefined} />
          </div>
          <div className="min-w-0">
            <h2 className="font-display font-semibold text-lg text-on-surface truncate">
              {displayName}
            </h2>
            <p className="text-sm text-on-surface-variant truncate">{email || "—"}</p>
            <p className="text-xs text-on-surface-variant mt-1">
              {memberSince ? `Member since ${memberSince}` : "Student member"}
            </p>
          </div>
        </div>
      </Card>

      <form action={formAction} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="p-4 sm:p-5">
            <h3 className="font-display font-semibold text-on-surface mb-1">Personal info</h3>
            <p className="text-xs text-on-surface-variant mb-4">
              Your name as it appears in your workspace.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input name="firstName" label="First Name" defaultValue={firstName} required />
              <Input name="lastName" label="Last Name" defaultValue={lastName} />
            </div>
          </Card>

          <Card className="p-4 sm:p-5">
            <h3 className="font-display font-semibold text-on-surface mb-1">Contact</h3>
            <p className="text-xs text-on-surface-variant mb-4">
              How we reach you and where you’re based.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 flex flex-col gap-1.5">
                <label className="text-sm font-medium text-on-surface">Email</label>
                <div className="w-full h-11 flex items-center px-3.5 gap-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface-variant">
                  <Mail size={16} className="shrink-0 text-on-surface-variant" />
                  <span className="truncate">{email || "—"}</span>
                </div>
              </div>
              <div className="sm:col-span-2">
                <Select
                  name="country"
                  label="Country / Region"
                  defaultValue={country}
                  options={[
                    { value: "", label: "Not listed / Prefer not to say" },
                    ...COUNTRY_OPTIONS.map((c) => ({
                      value: c.code,
                      label: `${c.name} (${c.currency})`,
                    })),
                  ]}
                />
                <p className="text-xs text-on-surface-variant mt-1.5">
                  Used to charge you in your local currency. You always pay in the currency shown at
                  checkout.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 sm:p-5">
            <h3 className="font-display font-semibold text-on-surface mb-1">Academic</h3>
            <p className="text-xs text-on-surface-variant mb-4">
              Helps tailor recommendations and support.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 flex flex-col gap-1.5">
                <label className="text-sm font-medium text-on-surface">Institution</label>
                <Input
                  name="institution"
                  placeholder="e.g. University of Melbourne"
                  defaultValue={institution}
                />
              </div>
              <div className="sm:col-span-2">
                <Select
                  name="levelOfStudy"
                  label="Level of Study"
                  placeholder="Select your level"
                  defaultValue={levelOfStudy || ""}
                  options={LEVELS.map((l) => ({ value: l, label: l }))}
                />
              </div>
            </div>
          </Card>

          <Card className="p-4 sm:p-5">
            <h3 className="font-display font-semibold text-on-surface mb-1">Security</h3>
            <p className="text-xs text-on-surface-variant mb-4">
              Your sign-in and account details.
            </p>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 p-3 rounded-lg border border-outline-variant bg-surface-container-low/40">
                <span className="w-9 h-9 rounded-lg bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0">
                  <ShieldCheck size={16} />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-on-surface">Sign-in method</p>
                  <p className="text-xs text-on-surface-variant">Google or email verification code</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg border border-outline-variant bg-surface-container-low/40">
                <span className="w-9 h-9 rounded-lg bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0">
                  <GraduationCap size={16} />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-on-surface">Academic profile</p>
                  <p className="text-xs text-on-surface-variant truncate">
                    {institution || "No institution set"} · {levelOfStudy || "No level set"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg border border-outline-variant bg-surface-container-low/40">
                <span className="w-9 h-9 rounded-lg bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0">
                  <BookOpen size={16} />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-on-surface">Membership</p>
                  <p className="text-xs text-on-surface-variant">
                    {memberSince ? `Member since ${memberSince}` : "Student member"}
                  </p>
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
