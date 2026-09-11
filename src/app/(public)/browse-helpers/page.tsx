"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Star, Clock, MessageSquare, ChevronRight } from "lucide-react";

const helpers = [
  { id: "maya-r", name: "Maya R.", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face", rating: 4.9, reviews: 127, bio: "Published literary analyst with expertise in essay structure, thesis development, and MLA/APA formatting. I help you find your voice while mastering academic conventions.", subjects: ["English Literature", "Essay Writing", "Creative Writing"], helpType: "Essay Writing", onTime: "98%", avgReply: "< 1 hour", verified: true },
  { id: "daniel-k", name: "Daniel K.", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face", rating: 4.8, reviews: 98, bio: "Graduate researcher specializing in statistical analysis and research methodology. I make complex data concepts accessible and help you build solid analytical frameworks.", subjects: ["Statistics", "Mathematics", "Research Methods"], helpType: "Project Guidance", onTime: "96%", avgReply: "< 2 hours", verified: true },
  { id: "priya-s", name: "Priya S.", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face", rating: 4.9, reviews: 156, bio: "Molecular biology graduate with a passion for scientific writing. I help you craft clear, well-structured lab reports and understand experimental methodology deeply.", subjects: ["Biology", "Chemistry", "Lab Reports"], helpType: "Report Writing", onTime: "99%", avgReply: "< 1 hour", verified: true },
  { id: "julian-b", name: "Julian B.", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face", rating: 4.7, reviews: 84, bio: "Computer science tutor with industry experience. From algorithms to web development, I help you understand the concepts behind the code, not just the syntax.", subjects: ["Computer Science", "Programming", "Data Structures"], helpType: "Tutoring", onTime: "95%", avgReply: "< 3 hours", verified: true },
  { id: "elena-v", name: "Elena V.", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face", rating: 4.9, reviews: 143, bio: "Economics graduate with research experience. I help you understand economic theory, build strong arguments in essays, and analyze real-world case studies.", subjects: ["Economics", "Business Studies", "Finance"], helpType: "Essay Writing", onTime: "97%", avgReply: "< 1 hour", verified: true },
  { id: "nathan-c", name: "Nathan C.", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face", rating: 4.8, reviews: 112, bio: "History major with a talent for making the past come alive. I guide you through source analysis, historiography, and compelling historical argument construction.", subjects: ["History", "Political Science", "Philosophy"], helpType: "Homework Help", onTime: "97%", avgReply: "< 2 hours", verified: true },
];

const allSubjects = ["All Subjects", "English Literature", "Mathematics", "Biology", "Chemistry", "Physics", "Computer Science", "History", "Economics", "Business Studies", "Statistics", "Philosophy"];
const helpTypes = ["All Types", "Essay Writing", "Report Writing", "Homework Help", "Project Guidance", "Tutoring", "Editing & Proofreading"];
const ratings = ["Any Rating", "4.5+", "4.7+", "4.9+"];

export default function BrowseHelpersPage() {
  return (
    <Suspense fallback={null}>
      <BrowseHelpersInner />
    </Suspense>
  );
}

function BrowseHelpersInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlSubject = searchParams.get("subject");
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState(
    urlSubject && allSubjects.includes(urlSubject) ? urlSubject : "All Subjects"
  );
  const [helpType, setHelpType] = useState("All Types");
  const [rating, setRating] = useState("Any Rating");
  const [topRated, setTopRated] = useState(false);

  function updateSubject(value: string) {
    setSubject(value);
    const params = new URLSearchParams(window.location.search);
    if (value !== "All Subjects") params.set("subject", value);
    else params.delete("subject");
    const q = params.toString();
    router.replace(q ? `/browse-helpers?${q}` : "/browse-helpers", { scroll: false });
  }

  const filtered = helpers.filter((h) => {
    if (search && !h.name.toLowerCase().includes(search.toLowerCase()) && !h.subjects.some(s => s.toLowerCase().includes(search.toLowerCase()))) return false;
    if (subject !== "All Subjects" && !h.subjects.includes(subject)) return false;
    if (helpType !== "All Types" && h.helpType !== helpType) return false;
    if (rating === "4.5+" && h.rating < 4.5) return false;
    if (rating === "4.7+" && h.rating < 4.7) return false;
    if (rating === "4.9+" && h.rating < 4.9) return false;
    return true;
  });

  const sorted = topRated ? [...filtered].sort((a, b) => b.rating - a.rating) : filtered;

  const activeFilters = [
    subject !== "All Subjects" && { label: subject, clear: () => updateSubject("All Subjects") },
    helpType !== "All Types" && { label: helpType, clear: () => setHelpType("All Types") },
    rating !== "Any Rating" && { label: rating, clear: () => setRating("Any Rating") },
    topRated && { label: "Top Rated", clear: () => setTopRated(false) },
  ].filter(Boolean) as { label: string; clear: () => void }[];

  return (
    <>
      {/* Breadcrumb & Header */}
      <div className="bg-surface-container-high border-b border-outline-variant/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <nav className="flex items-center gap-2 text-sm text-on-surface-variant mb-4">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-on-surface font-medium">Browse Helpers</span>
          </nav>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-on-surface mb-2">
            Find the right helper for your coursework
          </h1>
          <p className="text-on-surface-variant max-w-2xl">
            Browse verified peer helpers by subject, rating, and expertise. Request help or book a tutoring session.
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="sticky top-16 z-40 bg-surface-container-lowest border-b border-outline-variant/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
              <input
                type="text"
                placeholder="Search by name or subject..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-11 pl-11 pr-4 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all"
              />
            </div>
            <div className="flex gap-3 flex-wrap">
              <select value={subject} onChange={(e) => updateSubject(e.target.value)} className="h-11 px-3.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:border-primary-container appearance-none cursor-pointer">
                {allSubjects.map((s) => <option key={s}>{s}</option>)}
              </select>
              <select value={helpType} onChange={(e) => setHelpType(e.target.value)} className="h-11 px-3.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:border-primary-container appearance-none cursor-pointer">
                {helpTypes.map((t) => <option key={t}>{t}</option>)}
              </select>
              <select value={rating} onChange={(e) => setRating(e.target.value)} className="h-11 px-3.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:border-primary-container appearance-none cursor-pointer">
                {ratings.map((r) => <option key={r}>{r}</option>)}
              </select>
              <button
                onClick={() => setTopRated(!topRated)}
                className={`h-11 px-4 rounded-lg text-sm font-medium border transition-all cursor-pointer flex items-center gap-1.5 ${topRated ? "bg-primary-container text-on-primary border-primary-container" : "bg-surface-container-lowest border-outline-variant text-on-surface hover:bg-surface-container-low"}`}
              >
                <Star className="w-4 h-4" />
                Top Rated
              </button>
            </div>
          </div>

          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {activeFilters.map((f) => (
                <span key={f.label} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-container/10 text-primary text-xs font-medium">
                  {f.label}
                  <button onClick={f.clear} className="hover:text-primary-container cursor-pointer">&times;</button>
                </span>
              ))}
              <button
                onClick={() => { setSubject("All Subjects"); setHelpType("All Types"); setRating("Any Rating"); setTopRated(false); }}
                className="text-xs text-on-surface-variant hover:text-primary cursor-pointer"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Helpers Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sorted.map((helper) => (
            <div key={helper.id} className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <img src={helper.avatar} alt={helper.name} className="w-14 h-14 rounded-full object-cover" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-display font-bold text-on-surface">{helper.name}</h3>
                      {helper.verified && <span className="material-symbols-outlined text-primary text-sm">verified</span>}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-semibold text-on-surface">{helper.rating}</span>
                      <span className="text-xs text-on-surface-variant">({helper.reviews} reviews)</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-on-surface-variant leading-relaxed mb-4 line-clamp-3">{helper.bio}</p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {helper.subjects.map((s) => (
                    <span key={s} className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-xs font-medium">{s}</span>
                  ))}
                </div>
                <div className="flex items-center gap-4 text-xs text-on-surface-variant mb-4">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {helper.onTime} on-time
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5" />
                    Avg reply: {helper.avgReply}
                  </span>
                </div>
                <div className="flex gap-3">
                  <Link href={`/helpers/${helper.id}`} className="flex-1 text-center px-4 py-2 text-sm font-medium border border-outline-variant rounded-xl text-on-surface hover:bg-surface-container-low transition-colors">
                    View Profile
                  </Link>
                  <Link href="/contact" className="flex-1 text-center px-4 py-2 text-sm font-medium bg-primary-container text-on-primary rounded-xl hover:bg-primary transition-colors">
                    Request Help
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center gap-2 mt-10">
          <button className="px-3 py-2 text-sm font-medium text-on-surface-variant border border-outline-variant rounded-lg hover:bg-surface-container-low transition-colors cursor-pointer" disabled>Previous</button>
          <button className="px-3 py-2 text-sm font-medium bg-primary-container text-on-primary rounded-lg">1</button>
          <button className="px-3 py-2 text-sm font-medium text-on-surface-variant border border-outline-variant rounded-lg hover:bg-surface-container-low transition-colors cursor-pointer">2</button>
          <button className="px-3 py-2 text-sm font-medium text-on-surface-variant border border-outline-variant rounded-lg hover:bg-surface-container-low transition-colors cursor-pointer">3</button>
          <button className="px-3 py-2 text-sm font-medium text-on-surface-variant border border-outline-variant rounded-lg hover:bg-surface-container-low transition-colors cursor-pointer">Next</button>
        </div>
      </div>

      {/* CTA Banner */}
      <section className="bg-surface-container-high border-t border-outline-variant/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h2 className="font-display text-2xl font-bold text-on-surface mb-3">Can&apos;t find the right helper?</h2>
          <p className="text-on-surface-variant mb-6">Tell us what you need and choose the verified helper who fits your subject and goals.</p>
          <Link href="/contact" className="inline-flex items-center gap-2 px-6 py-3 bg-primary-container text-on-primary rounded-xl font-semibold text-sm hover:bg-primary transition-colors">
            Submit a Request
          </Link>
        </div>
      </section>
    </>
  );
}
