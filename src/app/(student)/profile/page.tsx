import { Camera, Mail, GraduationCap, BookOpen, ShieldCheck, Bell, CreditCard, BadgeCheck, Check, MapPin } from "lucide-react";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Avatar from "@/components/ui/avatar";
import Badge from "@/components/ui/badge";
import StarRating from "@/components/ui/star-rating";

export default function ProfilePage() {
  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-on-surface">Profile Settings</h1>
        <p className="text-sm text-on-surface-variant mt-0.5">Manage your personal details and security</p>
      </div>

      <section className="rounded-2xl bg-surface-container-lowest border border-outline-variant p-6 flex flex-col sm:flex-row sm:items-center gap-5">
        <div className="relative">
          <Avatar name="Alex Chen" size="lg" />
          <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary-container text-on-primary flex items-center justify-center shadow cursor-pointer hover:bg-primary transition-colors">
            <Camera size={13} />
          </button>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="font-display font-bold text-xl text-on-surface">Alex Chen</h2>
            <Badge variant="success"><BadgeCheck size={12} /> Verified Student</Badge>
            <Badge variant="secondary">Junior</Badge>
          </div>
          <p className="text-sm text-on-surface-variant mt-1 flex items-center gap-1.5 flex-wrap">
            <Mail size={14} /> alex.chen@eastview.edu
            <span className="w-1 h-1 rounded-full bg-outline-variant inline-block mx-1" />
            <GraduationCap size={14} /> Eastview University
          </p>
          <p className="text-xs text-on-surface-variant mt-1.5 flex items-center gap-1.5">
            <MapPin size={13} /> Biology · Psychology double major · Member since Sep 2025
          </p>
        </div>
        <div className="flex sm:flex-col gap-2 sm:min-w-[120px]">
          <StarRating rating={4.6} reviewCount={21} />
          <p className="text-xs text-on-surface-variant">Students you&apos;ve worked with rate reliability</p>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card className="p-6">
            <h3 className="font-display font-semibold text-on-surface mb-1">Personal Information</h3>
            <p className="text-xs text-on-surface-variant mb-5">Used to personalize your workspace and match helpers.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="First Name" defaultValue="Alex" />
              <Input label="Last Name" defaultValue="Chen" />
              <div className="sm:col-span-2">
                <Input label="University Email" type="email" defaultValue="alex.chen@eastview.edu" icon={<Mail size={18} />} />
              </div>
              <Input label="Preferred Name" defaultValue="Alex" />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-on-surface">Pronouns</label>
                <select className="w-full h-11 px-3.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 appearance-none cursor-pointer">
                  <option>He / Him</option>
                  <option>She / Her</option>
                  <option>They / Them</option>
                  <option>Prefer not to say</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-5 pt-5 border-t border-outline-variant">
              <ShieldCheck size={15} className="text-success shrink-0" />
              <p className="text-xs text-on-surface-variant">
                Your email is tied to your university identity and can only be changed by support to keep academic integrity records consistent.
              </p>
            </div>
            <Button className="mt-4">Save Changes</Button>
          </Card>

          <Card className="p-6">
            <h3 className="font-display font-semibold text-on-surface mb-1">Academic & Interests</h3>
            <p className="text-xs text-on-surface-variant mb-5">
              Helps tailored mentor recommendations. <span className="font-medium text-on-surface">Honor Pass: <span className="text-success inline-flex items-center gap-1"><Check size={12} /> Clear</span></span>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-on-surface">Institution</label>
                <input value="Eastview University" readOnly className="w-full h-11 px-3.5 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface-variant" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-on-surface">Class Year</label>
                <select className="w-full h-11 px-3.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 appearance-none cursor-pointer">
                  <option>2028 — Junior</option>
                  <option>2027 — Senior</option>
                  <option>2026 — Sophomore</option>
                </select>
              </div>
              <div className="sm:col-span-2 flex flex-col gap-1.5">
                <label className="text-sm font-medium text-on-surface">Subjects I study</label>
                <div className="flex flex-wrap gap-2">
                  {["Biology 220", "Psychology 150", "History 201", "Calculus III"].map((s) => (
                    <span key={s} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container text-on-surface-variant text-xs font-medium">
                      <BookOpen size={12} /> {s}
                      <button className="ml-1 text-on-surface-variant hover:text-error cursor-pointer">×</button>
                    </span>
                  ))}
                  <button className="px-3 py-1.5 rounded-full border border-dashed border-outline-variant text-xs font-medium text-on-surface-variant hover:border-primary-container hover:text-primary transition-colors cursor-pointer">
                    + Add subject
                  </button>
                </div>
              </div>
            </div>
            <Button className="mt-5">Save Academic Info</Button>
          </Card>
        </div>

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
                <span className="w-9 h-9 rounded-lg bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0"><ShieldCheck size={16} /></span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-on-surface">Two-factor authentication</p>
                  <Badge variant="success" className="mt-0.5">Enabled</Badge>
                </div>
              </button>
              <button className="flex items-center gap-3 p-3 rounded-lg border border-outline-variant hover:bg-surface-container-low text-left transition-colors cursor-pointer w-full">
                <span className="w-9 h-9 rounded-lg bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0"><CreditCard size={16} /></span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-on-surface">Payment method</p>
                  <p className="text-[11px] text-on-surface-variant">Visa •••• 4242 · Saved as primary payment method</p>
                </div>
              </button>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-display font-semibold text-on-surface mb-3 inline-flex items-center gap-2">
              <Bell size={16} className="text-primary" /> Notification Preferences
            </h3>
            <div className="flex flex-col gap-3 text-sm">
              <label className="flex items-center justify-between gap-3 cursor-pointer">
                <span className="text-on-surface-variant">Chat & helper replies</span>
                <input type="checkbox" defaultChecked className="w-4 h-4 accent-primary-container" />
              </label>
              <label className="flex items-center justify-between gap-3 cursor-pointer">
                <span className="text-on-surface-variant">Delivery & revision updates</span>
                <input type="checkbox" defaultChecked className="w-4 h-4 accent-primary-container" />
              </label>
              <label className="flex items-center justify-between gap-3 cursor-pointer">
                <span className="text-on-surface-variant">Weekly academic digest</span>
                <input type="checkbox" className="w-4 h-4 accent-primary-container" />
              </label>
            </div>
            <Button variant="outline" size="sm" className="mt-4 w-full justify-center">Save Preferences</Button>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-primary-container to-secondary-container text-on-primary border-0">
            <h3 className="font-display font-semibold mb-1">Academic Honor Pass</h3>
            <p className="text-sm text-on-primary/85">Status: Clear · 0 flags</p>
            <p className="text-[11px] text-on-primary/70 mt-1 leading-relaxed">
              Verified against Eastview University integrity records. Displayed to helpers as part of your trust profile.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}