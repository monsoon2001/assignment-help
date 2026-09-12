"use client";

import { useState } from "react";
import { useActionState } from "react";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Textarea from "@/components/ui/textarea";
import Badge from "@/components/ui/badge";
import Avatar from "@/components/ui/avatar";
import StarRating from "@/components/ui/star-rating";
import { Save, X, Plus, Mail, UserPlus } from "lucide-react";
import { saveHelperProfile, type HelperProfileResult } from "./actions";

export default function HelperProfile({
  name = "",
  avatarUrl = null,
  firstName = "",
  lastName = "",
  email = "",
  hourlyRate = 20,
  rating = 0,
  reviewCount = 0,
  initialBio = "",
  initialSubjects = [],
}: {
  name?: string;
  avatarUrl?: string | null;
  firstName?: string;
  lastName?: string;
  email?: string;
  hourlyRate?: number;
  rating?: number;
  reviewCount?: number;
  initialBio?: string;
  initialSubjects?: string[];
}) {
  const [state, formAction, pending] = useActionState<HelperProfileResult, FormData>(
    saveHelperProfile,
    { ok: false, message: "" }
  );

  const [bio, setBio] = useState(initialBio);
  const [subjects, setSubjects] = useState<string[]>(initialSubjects);
  const [newSubject, setNewSubject] = useState("");

  const addSubject = () => {
    if (newSubject.trim() && !subjects.some((s) => s.toLowerCase() === newSubject.trim().toLowerCase())) {
      setSubjects([...subjects, newSubject.trim()]);
      setNewSubject("");
    }
  };

  const removeSubject = (s: string) => {
    setSubjects(subjects.filter((sub) => sub !== s));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-on-surface">Profile Settings</h1>
          <p className="text-on-surface-variant mt-1">Manage what students see on your public helper profile.</p>
        </div>
      </div>

      <form action={formAction} className="space-y-6">
        <Card className="p-6 space-y-6">
          <div className="flex items-center gap-4 pb-5 border-b border-outline-variant">
            <Avatar name={name || firstName || "PeerCraft Helper"} size="lg" src={avatarUrl ?? undefined} />
            <div>
              <h2 className="font-display text-lg font-semibold text-on-surface">{name || `${firstName} ${lastName}` || "PeerCraft Helper"}</h2>
              <StarRating rating={rating} reviewCount={reviewCount} />
            </div>
          </div>
          <h2 className="font-display text-lg font-semibold text-on-surface">Basic Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input name="firstName" label="First Name" defaultValue={firstName} required />
            <Input name="lastName" label="Last Name" defaultValue={lastName} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-on-surface">Email</label>
            <div className="flex items-center gap-2">
              <span className="w-full h-11 flex items-center px-3.5 gap-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface-variant">
                <Mail size={16} className="shrink-0 text-on-surface-variant" />
                {email || "—"}
              </span>
            </div>
          </div>
          <Input name="hourlyRate" label="Hourly Rate ($)" defaultValue={String(hourlyRate)} type="number" min={0} step="0.01" />
          <Textarea name="bio" label="Bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={4} placeholder="Introduce yourself to students. Tell them what you help with and how you work." />
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="font-display text-lg font-semibold text-on-surface">Subjects</h2>
          <p className="text-sm text-on-surface-variant">Add or remove the subjects you can help with. These appear as badges on your profile.</p>
          <div className="flex flex-wrap gap-2">
            {subjects.length === 0 && (
              <span className="text-sm text-on-surface-variant">No subjects yet. Add some below.</span>
            )}
            {subjects.map((s) => (
              <Badge key={s} variant="secondary" className="pr-1">
                {s}
                <button type="button" onClick={() => removeSubject(s)} className="ml-1 p-0.5 rounded-full hover:bg-secondary-container transition-colors">
                  <X size={12} />
                </button>
              </Badge>
            ))}
          </div>
          <input type="hidden" name="subjects" value="" />
          {subjects.map((s) => (
            <input key={s} type="hidden" name="subjects" value={s} />
          ))}
          <div className="flex items-center gap-2">
            <Input
              placeholder="Add a subject, e.g. Biology"
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addSubject();
                }
              }}
              className="flex-1"
            />
            <Button type="button" variant="outline" onClick={addSubject}><Plus size={16} />Add</Button>
          </div>
        </Card>

        {state.message && (
          <p className={`text-sm rounded-lg px-3 py-2 ${state.ok ? "text-success bg-emerald-50" : "text-error bg-error-container/30"}`}>
            {state.message}
          </p>
        )}

        <div className="flex justify-end gap-3 pb-8">
          <Button type="submit" disabled={pending}>
            {pending ? <UserPlus size={16} className="animate-spin" /> : <Save size={16} />}
            {pending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}