"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Search, Star, Clock, MessageSquare, ChevronRight, Loader2 } from "lucide-react";
import { fetchHelperCandidates, type HelperCandidate } from "@/lib/requests";

const ratings = ["Any Rating", "4.5+", "4.7+", "4.9+"];

export default function BrowseHelpersPage() {
  const [helpers, setHelpers] = useState<HelperCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [rating, setRating] = useState("Any Rating");
  const [topRated, setTopRated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const result = await fetchHelperCandidates();
      if (cancelled) return;
      if ("error" in result) {
        console.error(result.error);
      } else {
        setHelpers(result.helpers);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = helpers.filter((h) => {
    const name = h.user?.name ?? "";
    const subjects = h.subjects ?? [];
    if (search && !name.toLowerCase().includes(search.toLowerCase()) && !subjects.some(s => s.toLowerCase().includes(search.toLowerCase()))) return false;
    if (rating === "4.5+" && h.rating_avg < 4.5) return false;
    if (rating === "4.7+" && h.rating_avg < 4.7) return false;
    if (rating === "4.9+" && h.rating_avg < 4.9) return false;
    if (topRated && h.rating_avg < 4.9) return false;
    return true;
  });

  return (
    <>
      {/* Page Header */}
      <div className="bg-surface-container-high border-b border-outline-variant/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <nav className="flex items-center gap-2 text-sm text-on-surface-variant mb-4">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-on-surface font-medium">Browse Helpers</span>
          </nav>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-on-surface mb-2">
            Find the right helper for your coursework
          </h1>
          <p className="text-on-surface-variant max-w-2xl">
            Browse verified peer helpers. Request help or book a tutoring session.
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
        </div>
      </div>

      {/* Helpers Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-on-surface-variant">
            <Loader2 size={24} className="animate-spin text-primary" />
            <p className="text-sm">Loading helpers...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-on-surface-variant">
              {helpers.length === 0
                ? "No helpers available yet. Check back soon."
                : "No helpers match your filters."}
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((h) => {
              const name = h.user?.name ?? "PeerCraft Helper";
              const avatar = h.user?.avatar_url ?? null;
              const initials = name.split(/\s+/).map((p) => p[0]).join("").toUpperCase().slice(0, 2);
              return (
                <div
                  key={h.user_id}
                  className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6 flex flex-col gap-4 hover:shadow-lg transition-all"
                >
                  <div className="flex items-center gap-4">
                    {avatar ? (
                      <img src={avatar} alt={name} className="w-14 h-14 rounded-full object-cover" />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-primary-container/20 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                        {initials}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h2 className="font-display font-bold text-on-surface truncate">{name}</h2>
                        <span className="material-symbols-outlined text-primary text-sm shrink-0">verified</span>
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span className="text-sm font-semibold text-on-surface">
                          {h.rating_avg > 0 ? h.rating_avg.toFixed(1) : "New"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {h.bio && (
                    <p className="text-sm text-on-surface-variant line-clamp-3">{h.bio}</p>
                  )}

                  {h.subjects.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {h.subjects.map((s) => (
                        <span key={s} className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-xs font-medium">{s}</span>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-3 mt-auto">
                    <Link href={`/helpers/${h.user_id}`} className="flex-1 text-center px-4 py-2 text-sm font-medium border border-outline-variant rounded-xl text-on-surface hover:bg-surface-container-low transition-colors">
                      View Profile
                    </Link>
                    <Link href="/sign-up" className="flex-1 text-center px-4 py-2 text-sm font-medium bg-primary-container text-on-primary rounded-xl hover:bg-primary transition-colors">
                      Request Help
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
