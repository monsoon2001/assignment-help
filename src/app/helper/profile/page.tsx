"use client";

import { useState } from "react";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Textarea from "@/components/ui/textarea";
import Badge from "@/components/ui/badge";
import { Save, X, Plus } from "lucide-react";

const defaultSubjects = [
  "Environmental Science",
  "Business Studies",
  "Mathematics",
  "Computer Science",
  "Psychology",
];

const availabilitySlots = [
  { day: "Monday", start: "9:00 AM", end: "5:00 PM", active: true },
  { day: "Tuesday", start: "9:00 AM", end: "5:00 PM", active: true },
  { day: "Wednesday", start: "10:00 AM", end: "4:00 PM", active: true },
  { day: "Thursday", start: "9:00 AM", end: "5:00 PM", active: true },
  { day: "Friday", start: "9:00 AM", end: "3:00 PM", active: true },
  { day: "Saturday", start: "10:00 AM", end: "2:00 PM", active: false },
  { day: "Sunday", start: "", end: "", active: false },
];

export default function HelperProfile() {
  const [bio, setBio] = useState(
    "Experienced peer tutor specializing in STEM and business subjects. I'm passionate about breaking down complex concepts into understandable parts. Currently pursuing my Master's in Environmental Science with a focus on renewable energy policy."
  );
  const [subjects, setSubjects] = useState(defaultSubjects);
  const [newSubject, setNewSubject] = useState("");

  const addSubject = () => {
    if (newSubject.trim() && !subjects.includes(newSubject.trim())) {
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
          <p className="text-on-surface-variant mt-1">Manage your helper profile and availability.</p>
        </div>
        <Button><Save size={16} />Save Changes</Button>
      </div>

      <Card className="p-6 space-y-6">
        <h2 className="font-display text-lg font-semibold text-on-surface">Basic Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="First Name" defaultValue="Maya" />
          <Input label="Last Name" defaultValue="Patel" />
        </div>
        <Input label="Email" defaultValue="maya.peercraft@email.com" type="email" />
        <Input label="Hourly Rate ($)" defaultValue="25" type="number" />
        <Textarea label="Bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={4} />
      </Card>

      <Card className="p-6 space-y-4">
        <h2 className="font-display text-lg font-semibold text-on-surface">Subjects</h2>
        <p className="text-sm text-on-surface-variant">Add or remove the subjects you can help with.</p>
        <div className="flex flex-wrap gap-2">
          {subjects.map((s) => (
            <Badge key={s} variant="secondary" className="pr-1">
              {s}
              <button onClick={() => removeSubject(s)} className="ml-1 p-0.5 rounded-full hover:bg-secondary-container transition-colors">
                <X size={12} />
              </button>
            </Badge>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Input placeholder="Add a subject..." value={newSubject} onChange={(e) => setNewSubject(e.target.value)} className="flex-1" />
          <Button variant="outline" onClick={addSubject}><Plus size={16} />Add</Button>
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <h2 className="font-display text-lg font-semibold text-on-surface">Availability</h2>
        <p className="text-sm text-on-surface-variant">Set your weekly availability schedule.</p>
        <div className="space-y-3">
          {availabilitySlots.map((slot) => (
            <div key={slot.day} className="flex items-center gap-4 p-3 rounded-xl bg-surface-container-low border border-outline-variant/20">
              <div className="w-28"><p className="text-sm font-medium text-on-surface">{slot.day}</p></div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={slot.active} className="sr-only peer" readOnly />
                <div className="w-9 h-5 bg-outline-variant rounded-full peer peer-checked:bg-primary-container transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
              </label>
              {slot.active ? (
                <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                  <span>{slot.start}</span><span>-</span><span>{slot.end}</span>
                </div>
              ) : (
                <span className="text-sm text-outline">Unavailable</span>
              )}
            </div>
          ))}
        </div>
      </Card>

      <div className="flex justify-end gap-3 pb-8">
        <Button variant="outline">Cancel</Button>
        <Button><Save size={16} />Save Changes</Button>
      </div>
    </div>
  );
}
