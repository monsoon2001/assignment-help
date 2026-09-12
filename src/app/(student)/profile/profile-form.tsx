"use client";

import { useActionState } from "react";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Avatar from "@/components/ui/avatar";
import StarRating from "@/components/ui/star-rating";
import { Save, Mail, GraduationCap, MapPin } from "lucide-react";
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
  memberSince = null,
}: {
  name?: string;
  email?: string;
  avatarUrl?: string | null;
  firstName?: string;
  lastName?: string;
  institution?: string;
  levelOfStudy?: string;
  memberSince?: number | null;
}) {
  const [state, formAction, pending] = useActionState<StudentProfileResult, FormData>(
    saveStudentProfile,
    { ok: false, message: "" }
  );

  const displayName = name || (email ? email.split("@")[0] : "PeerCraft Student");

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-on-surface">Profile Settings</h1>
        <p className="text-sm text-on-surface-variant mt-0.5">Manage your personal details, academics, and security</p>
      </div>

      <section className="rounded-2xl bg-surface-container-lowest border border-outline-variant p-6 flex flex-col sm:flex-row sm:items-center gap-5">
        <Avatar name={displayName} size="lg" src={avatarUrl ?? undefined} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="font-display font-bold text-xl text-on-surface">{displayName}</h2>
          </div>
          <p className="text-sm text-on-surface-variant mt-1 flex items-center gap-1.5 flex-wrap">
            <Mail size={14} /> {email}
            {institution && (
              <>
                <span className="w-1 h-1 rounded-full bg-outline-variant inline-block mx-1" />
                <GraduationCap size={14} /> {institution}
              </>
            )}
          </p>
          <p className="text-xs text-on-surface-variant mt-1.5 flex items-center gap-1.5">
            <MapPin size={13} />{levelOfStudy ? <>{levelOfStudy}{memberSince ? ` · Member since ${memberSince}` : ""}</> : memberSince ? <>Member since {memberSince}</> : "Student member"}
          </p>
        </div>
        <div className="flex sm:flex-col gap-2 sm:min-w-[120px]">
          <StarRating rating={4.6} reviewCount={21} />
          <p className="text-xs text-on-surface-variant">Students you&apos;ve worked with rate reliability</p>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <form action={formAction} className="lg:col-span-2 flex flex-col gap-6">
          <Card className="p-6">
            <h3 className="font-display font-semibold text-on-surface mb-1">Personal Information</h3>
            <p className="text-xs text-on-surface-variant mb-5">Used to personalize your workspace and match helpers.</p>
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
          </Card>

          <Card className="p-6">
            <h3 className="font-display font-semibold text-on-surface mb-1">Academic Information</h3>
            <p className="text-xs text-on-surface-variant mb-5">
              Helps tailored mentor recommendations.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 flex flex-col gap-1.5">
                <label className="text-sm font-medium text-on-surface">Institution</label>
                <Input
                  name="institution"
                  placeholder="e.g. Eastview University"
                  defaultValue={institution}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-on-surface">Level of Study</label>
                <select
                  name="levelOfStudy"
                  defaultValue={levelOfStudy || ""}
                  className="w-full h-11 px-3.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 appearance-none cursor-pointer"
                >
                  <option value="" disabled>Select your level</option>
                  {LEVELS.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
            </div>
          </Card>

          {state.message && (
            <p className={`text-sm rounded-lg px-3 py-2 ${state.ok ? "text-success bg-emerald-50" : "text-error bg-error-container/30"}`}>
              {state.message}
            </p>
          )}

          <div className="flex justify-end">
            <Button type="submit" disabled={pending}>
              <Save size={16} />
              {pending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>

        <div className="flex flex-col gap-6">
          <Card className="p-6">
            <h3 className="font-display font-semibold text-on-surface mb-4">Security</h3>
            <div className="flex flex-col gap-3">
              <button className="flex items-center gap-3 p-3 rounded-lg border border-outline-variant hover:bg-surface-container-low text-left transition-colors cursor-pointer w-full">
                <span className="w-9 h-9 rounded-lg bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0"><Mail size={16} /></span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-on-surface">Sign-in method</p>
                  <p className="text-[11px] text-on-surface-variant">Google or email verification code</p>
                </div>
              </button>
              <button className="flex items-center gap-3 p-3 rounded-lg border border-outline-variant hover:bg-surface-container-low text-left transition-colors cursor-pointer w-full">
                <span className="w-9 h-9 rounded-lg bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0"><GraduationCap size={16} /></span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-on-surface">Academic information</p>
                  <p className="text-[11px] text-on-surface-variant">{institution || "No institution set"} · {levelOfStudy || "No level set"}</p>
                </div>
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}