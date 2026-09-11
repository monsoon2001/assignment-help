import Link from "next/link";
import { ArrowRight, FileText, MessageSquare, CheckCircle2, Clock, Sparkles, Users } from "lucide-react";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";
import Badge from "@/components/ui/badge";
import Avatar from "@/components/ui/avatar";
import StarRating from "@/components/ui/star-rating";

const projects = [
  { title: "History Essay: Civil Rights Movement", desc: "Argumentative essay, 12 pages", progress: 75, due: "Due Oct 18", helper: "Sarah M.", color: "bg-primary-container" },
  { title: "Calculus Problem Set 4", desc: "Derivatives & applications, 25 problems", progress: 40, due: "Due Oct 21", helper: "David K.", color: "bg-secondary-container" },
];

const messages = [
  { from: { name: "Sarah Mitchell", initials: "SM" }, preview: "Draft outline is ready for your review when you have a moment.", time: "2m", unread: true },
  { from: { name: "David Kim", initials: "DK" }, preview: "I added notes on problems 14-16, we can review them together.", time: "1h", unread: true },
];

const mentors = [
  { name: "Prof. Aria Lawson", subject: "Rhetoric & Composition", rating: 4.9, reviews: 32, online: true, slug: "aria-lawson" },
  { name: "Marcus Reed", subject: "Calculus & Linear Algebra", rating: 4.8, reviews: 27, online: false, slug: "marcus-reed" },
];

export default function DashboardPage() {
  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6">
      <section className="rounded-2xl bg-gradient-to-br from-primary-container to-secondary-container text-on-primary p-8 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-white/10" />
        <div className="absolute right-24 bottom-0 w-20 h-20 rounded-full bg-white/10" />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-on-primary/80 mb-1">
              Academic Workspace
            </p>
            <h1 className="font-display font-bold text-3xl">Welcome back, Alex</h1>
            <p className="text-on-primary/80 text-sm mt-1.5">
              Your History essay is {projects[0].progress}% complete — Sarah is waiting on your latest notes.
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/browse-helpers">
              <Button variant="outline" className="bg-surface-container-lowest/10 border-white/40 text-on-primary hover:bg-white/20">
                <Users size={16} />
                Browse Helpers
              </Button>
            </Link>
            <Link href="/requests/new">
              <Button variant="ghost" className="bg-white text-primary-container hover:bg-surface-container-lowest">
                <Sparkles size={16} />
                Request Help
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 flex items-center gap-4">
          <span className="w-11 h-11 rounded-xl bg-primary-container text-on-primary flex items-center justify-center shrink-0">
            <FileText size={20} />
          </span>
          <div>
            <p className="text-2xl font-display font-bold text-on-surface">2</p>
            <p className="text-xs text-on-surface-variant">Active Requests</p>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-4">
          <span className="w-11 h-11 rounded-xl bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0">
            <MessageSquare size={20} />
          </span>
          <div>
            <p className="text-2xl font-display font-bold text-on-surface">3</p>
            <p className="text-xs text-on-surface-variant">Unread Messages</p>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-4">
          <span className="w-11 h-11 rounded-xl bg-tertiary-container text-on-tertiary flex items-center justify-center shrink-0">
            <CheckCircle2 size={20} />
          </span>
          <div>
            <p className="text-2xl font-display font-bold text-on-surface">8</p>
            <p className="text-xs text-on-surface-variant">Completed Projects</p>
          </div>
        </Card>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        <div className="xl:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-lg text-on-surface">Your Current Work</h2>
            <Link href="/requests" className="text-sm font-semibold text-primary inline-flex items-center gap-1 hover:underline">
              View all <ArrowRight size={14} />
            </Link>
          </div>

          <Card hover className="p-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-10 h-10 rounded-xl bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0 font-semibold text-sm">
                  H
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-display font-semibold text-on-surface truncate">{projects[0].title}</h3>
                    <Badge variant="success" dot>In Progress</Badge>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-0.5">{projects[0].desc} · {projects[0].due}</p>
                </div>
              </div>
              <span className="text-xs text-on-surface-variant shrink-0">Helper: {projects[0].helper}</span>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <div className="flex-1 h-2 rounded-full bg-surface-container overflow-hidden">
                <div className={`h-full rounded-full ${projects[0].color}`} style={{ width: `${projects[0].progress}%` }} />
              </div>
              <span className="text-sm font-semibold text-on-surface">{projects[0].progress}%</span>
            </div>
            <Link href="/orders/ORD-2048">
              <Button variant="outline" size="sm" className="mt-4">
                Open Workspace <ArrowRight size={14} />
              </Button>
            </Link>
          </Card>

          <Card hover className="p-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-10 h-10 rounded-xl bg-primary-container text-on-primary flex items-center justify-center shrink-0 font-semibold text-sm">
                  C
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-display font-semibold text-on-surface truncate">{projects[1].title}</h3>
                    <Badge variant="primary" dot>In Progress</Badge>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-0.5">{projects[1].desc} · {projects[1].due}</p>
                </div>
              </div>
              <span className="text-xs text-on-surface-variant shrink-0">Helper: {projects[1].helper}</span>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <div className="flex-1 h-2 rounded-full bg-surface-container overflow-hidden">
                <div className={`h-full rounded-full ${projects[1].color}`} style={{ width: `${projects[1].progress}%` }} />
              </div>
              <span className="text-sm font-semibold text-on-surface">{projects[1].progress}%</span>
            </div>
            <Link href="/orders/ORD-2051">
              <Button variant="outline" size="sm" className="mt-4">
                Open Workspace <ArrowRight size={14} />
              </Button>
            </Link>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <h2 className="font-display font-bold text-lg text-on-surface mb-3">Recent Messages</h2>
            <Card className="divide-y divide-outline-variant/50 overflow-hidden">
              {messages.map((m) => (
                <Link href="/messages" key={m.from.name} className="flex items-start gap-3 p-4 hover:bg-surface-container-low transition-colors">
                  <Avatar name={m.from.name} size="md" online />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-on-surface truncate">{m.from.name}</p>
                      <span className="text-[10px] text-on-surface-variant shrink-0">{m.time}</span>
                    </div>
                    <p className="text-xs text-on-surface-variant truncate mt-0.5">{m.preview}</p>
                  </div>
                  {m.unread && <span className="w-2 h-2 rounded-full bg-primary-container shrink-0 mt-1.5" />}
                </Link>
              ))}
            </Card>
          </div>

          <div>
            <h2 className="font-display font-bold text-lg text-on-surface mb-3">Recommended Mentors</h2>
            <Card className="divide-y divide-outline-variant/50 overflow-hidden">
              {mentors.map((m) => (
                <div key={m.name} className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar name={m.name} size="md" online={m.online} />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-on-surface truncate">{m.name}</p>
                      <p className="text-xs text-on-surface-variant truncate">{m.subject}</p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <StarRating rating={m.rating} size={14} reviewCount={m.reviews} />
                    <Link href={`/helpers/${m.slug}`} className="text-xs font-semibold text-primary hover:underline">
                      View profile
                    </Link>
                  </div>
                </div>
              ))}
            </Card>
          </div>

          <Card className="p-5 bg-surface-container-low border border-outline-variant">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={16} className="text-primary" />
              <h3 className="font-semibold text-sm text-on-surface">Academic Honor Code</h3>
            </div>
            <p className="text-xs leading-relaxed text-on-surface-variant">
              Keep your account honest — helpers assist with learning and drafting, never with submitting
              work that isn&apos;t yours. Violations count against your Honor Pass.
            </p>
            <Link href="/honor-code" className="inline-flex items-center gap-1 text-xs font-semibold text-primary mt-2 hover:underline">
              Read the policy <ArrowRight size={12} />
            </Link>
          </Card>
        </div>
      </section>
    </div>
  );
}