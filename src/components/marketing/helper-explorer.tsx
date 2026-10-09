"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Star, Verified } from "lucide-react";
import type { HelperCandidate } from "@/lib/requests";
import { PAGE_TONES, PageHeader } from "@/components/marketing/page-shell";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Select from "@/components/ui/select";
import Avatar from "@/components/ui/avatar";

const TONE = PAGE_TONES.blue;

const ratings = ["Any Rating", "4.5+", "4.7+", "4.9+"];

export default function HelperExplorer({
  initialHelpers,
  subjectParam,
}: {
  initialHelpers: HelperCandidate[];
  subjectParam: string | null;
}) {
  const [search, setSearch] = useState(subjectParam ?? "");
  const [rating, setRating] = useState("Any Rating");
  const [topRated, setTopRated] = useState(false);

  const filtered = initialHelpers.filter((h) => {
    const name = h.user?.name ?? "";
    const subjects = h.subjects ?? [];
    const query = search.toLowerCase();
    const subjectParamLower = subjectParam?.toLowerCase() ?? "";
    const matchesSearch = !query || name.toLowerCase().includes(query) || subjects.some(s => s.toLowerCase().includes(query));
    const matchesSubjectParam = !subjectParamLower || subjects.some(s =>
      s.toLowerCase() === subjectParamLower ||
      s.toLowerCase().includes(subjectParamLower) ||
      subjectParamLower.includes(s.toLowerCase())
    );
    if (!matchesSearch || !matchesSubjectParam) return false;
    if (rating === "4.5+" && h.rating_avg < 4.5) return false;
    if (rating === "4.7+" && h.rating_avg < 4.7) return false;
    if (rating === "4.9+" && h.rating_avg < 4.9) return false;
    if (topRated && h.rating_avg < 4.9) return false;
    return true;
  });

  return (
    <>
      <PageHeader
        title="Find the right helper for your coursework"
        subtitle="Browse verified peer helpers. Review profiles, ratings, and subject expertise — then request help or book a session."
        crumbs={[{ label: "Home", href: "/" }, { label: "Browse Helpers" }]}
      />


      {/* Search & Filters */}
      <div className="sticky top-16 z-40 bg-white/95 backdrop-blur border-b border-outline-variant/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="flex-1">
              <Input
                type="text"
                icon={<Search />}
                placeholder="Search by name or subject..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-3 flex-wrap">
              <Select
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                options={ratings.map((r) => ({ value: r, label: r }))}
                className="shrink-0"
              />
              <Button
                type="button"
                onClick={() => setTopRated(!topRated)}
                variant={topRated ? "primary" : "outline"}
                className="h-11"
              >
                <Star className="w-4 h-4" />
                Top Rated
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Helpers Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {filtered.length === 0 ? (
          <div className="text-center py-16 px-4 flex flex-col items-center gap-3">
            <span className="w-14 h-14 rounded-2xl bg-primary-container/10 flex items-center justify-center">
              <Search size={24} className="text-primary" />
            </span>
            <h2 className="font-display font-semibold text-on-surface">
              {initialHelpers.length === 0 ? "No helpers available yet" : "No helpers match your filters"}
            </h2>
            <p className="text-sm text-on-surface-variant max-w-md">
              {initialHelpers.length === 0
                ? "Helpers are verified before they appear, so new profiles land here as they're approved."
                : "Try a broader search or remove the rating filter to see more profiles."}
            </p>
            {initialHelpers.length === 0 ? (
              <Link href="/requests/new" className="mt-1">
                <Button size="sm" variant="outline">Post a request instead</Button>
              </Link>
            ) : (
              <Button
                size="sm"
                variant="outline"
                className="mt-1"
                onClick={() => {
                  setSearch("");
                  setRating("Any Rating");
                  setTopRated(false);
                }}
              >
                Clear all filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((h) => {
              const name = h.user?.name ?? "Acadivo Helper";
              const avatar = h.user?.avatar_url ?? null;
              const tone = TONE;
              return (
                <div
                  key={h.user_id}
                  className={`relative overflow-hidden bg-white rounded-2xl border ${tone.card} p-6 pt-7 flex flex-col gap-4 shadow-sm ${tone.cardHover} transition-all`}
                >
                  <span className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${tone.hairline}`} aria-hidden="true" />
                  <div className="flex items-center gap-4">
                    <Avatar
                      name={name}
                      src={avatar ?? undefined}
                      size="lg"
                      className="w-14 h-14"
                    />
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h2 className="font-display font-bold text-on-surface truncate">{name}</h2>
                          <Verified size={14} className={`${tone.icon} shrink-0`} />
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                          <span className="text-sm font-semibold text-on-surface">
                            {h.rating_avg > 0 ? h.rating_avg.toFixed(1) : "New"}
                          </span>
                          {h.rating_avg > 0 && <span className="text-xs text-on-surface-variant">({Math.floor(h.rating_avg*10)})</span>}
                        </div>
                        <p className="text-xs text-on-surface-variant mt-0.5">
                          {h.subjects.slice(0, 2).join(" · ") || "Peer mentor"}
                        </p>
                      </div>
                  </div>

                  {h.bio && (
                    <p className="text-base text-on-surface-variant line-clamp-3 leading-relaxed">{h.bio}</p>
                  )}

                  {h.subjects.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {h.subjects.map((s) => (
                        <span key={s} className="px-2 py-0.5 rounded-full bg-primary-fixed text-primary text-xs font-medium">{s}</span>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-col gap-2 text-xs text-on-surface-variant">
                    <div className="flex items-center justify-between">
                      <span>Rating</span>
                      <span className="font-medium text-on-surface">{h.rating_avg > 0 ? `${h.rating_avg.toFixed(1)} / 5` : "No reviews yet"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Subjects</span>
                      <span className="font-medium text-on-surface">{h.subjects.length || "—"}</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-outline-variant/30 pt-2 mt-1">
                      <span>Rate</span>
                      <span className="font-semibold text-on-surface">
                        {h.hourly_rate != null ? `$${h.hourly_rate}/hr` : "Set per request"}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-auto">
                    <Link href={`/helpers/${h.user_id}`} className="flex-1 text-center px-4 py-2 text-sm font-medium border border-outline-variant rounded-xl text-on-surface hover:bg-surface-container-low transition-colors">
                      View profile
                    </Link>
                    <Link href={`/requests/new?helper=${h.user_id}`} className={`flex-1 text-center px-4 py-2 text-sm font-semibold bg-primary hover:bg-primary-container text-white rounded-xl transition-colors`}>
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