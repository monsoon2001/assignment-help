import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Star, Clock, MessageSquare, BookOpen, GraduationCap } from "lucide-react";
import Avatar from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type RawHelper = {
  id: string;
  name: string | null;
  email: string;
  avatar_url: string | null;
  helper_profiles:
    | {
        subjects: string[];
        skills: string[];
        bio: string | null;
        rating_avg: number;
      }[]
    | {
        subjects: string[];
        skills: string[];
        bio: string | null;
        rating_avg: number;
      }
    | null;
};

type RawReview = {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  student_user_id: string;
  student_name: string | null;
  student_avatar_url: string | null;
};

function ratingWord(rating: number) {
  if (rating === 5) return "Excellent";
  if (rating >= 4) return "Great";
  if (rating >= 3) return "Good";
  if (rating >= 2) return "Fair";
  return "Poor";
}

export default async function HelperProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: helperData } = await supabase
    .from("users")
    .select("id, name, email, avatar_url, helper_profiles(subjects, skills, bio, rating_avg)")
    .eq("id", id)
    .eq("role", "helper")
    .maybeSingle();

  if (!helperData) {
    notFound();
  }

  const helper = helperData as unknown as RawHelper;
  const profile = Array.isArray(helper.helper_profiles)
    ? (helper.helper_profiles[0] ?? null)
    : (helper.helper_profiles ?? null);

  const { data: reviewRows } = await supabase
    .from("helper_reviews")
    .select("id, rating, comment, created_at, student_user_id, student_name, student_avatar_url")
    .eq("helper_id", id)
    .order("created_at", { ascending: false });

  const reviews = (reviewRows as unknown as RawReview[] | null) ?? [];

  const { count: openOrdersCount } = await supabase
    .from("orders")
    .select("id", { count: "exact" })
    .eq("helper_id", id)
    .in("status", ["in_progress", "revision_requested"]);

  const { count: completedOrdersCount } = await supabase
    .from("orders")
    .select("id", { count: "exact" })
    .eq("helper_id", id)
    .eq("status", "completed");

  const rating = profile?.rating_avg ?? 0;
  const isNew = rating <= 0 && reviews.length === 0;
  const subjects = profile?.subjects ?? [];
  const skills = profile?.skills ?? [];
  const bio = profile?.bio ?? null;

  return (
    <>
      <div className="bg-surface-container-high border-b border-outline-variant/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <nav className="flex items-center gap-2 text-sm text-on-surface-variant mb-4">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/browse-helpers" className="hover:text-primary transition-colors">Helpers</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-on-surface font-medium">{helper.name ?? "Helper"}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid lg:grid-cols-3 gap-10">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Profile Header */}
            <div className="bg-surface-container-lowest rounded-2xl p-8 border border-outline-variant/30">
              <div className="flex flex-col sm:flex-row gap-6">
                <Avatar name={helper.name ?? "Helper"} src={helper.avatar_url ?? undefined} size="lg" className="w-24 h-24" />
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="font-display text-2xl font-bold text-on-surface">{helper.name ?? "Helper"}</h1>
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-container/10 text-primary text-xs font-semibold">
                      <span className="material-symbols-outlined text-sm">verified</span>
                      Verified
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-outline-variant"}`} />
                      ))}
                      <span className="text-sm font-semibold text-on-surface ml-1">
                        {isNew ? "New" : `${rating.toFixed(1)} · ${ratingWord(rating)}`}
                      </span>
                    </div>
                    {!isNew && (
                      <span className="text-sm text-on-surface-variant">
                        ({reviews.length} {reviews.length === 1 ? "review" : "reviews"})
                      </span>
                    )}
                  </div>
                  {bio && <p className="text-sm text-on-surface-variant leading-relaxed">{bio}</p>}
                </div>
              </div>
            </div>

            {/* About */}
            {bio && (
              <div className="bg-surface-container-lowest rounded-2xl p-8 border border-outline-variant/30">
                <h2 className="font-display text-lg font-bold text-on-surface mb-4">About {helper.name}</h2>
                <p className="text-sm text-on-surface-variant leading-relaxed">{bio}</p>
              </div>
            )}

            {/* Specialties */}
            {skills.length > 0 && (
              <div className="bg-surface-container-lowest rounded-2xl p-8 border border-outline-variant/30">
                <h2 className="font-display text-lg font-bold text-on-surface mb-4">Specialties</h2>
                <div className="flex flex-wrap gap-2">
                  {skills.map((s) => (
                    <span key={s} className="px-3 py-1.5 rounded-full bg-secondary-container text-on-secondary-container text-sm font-medium">{s}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="bg-surface-container-lowest rounded-2xl p-8 border border-outline-variant/30">
              <h2 className="font-display text-lg font-bold text-on-surface mb-6">Reviews</h2>
              {reviews.length === 0 ? (
                <p className="text-sm text-on-surface-variant">
                  No reviews yet. Be the first to work with {helper.name ?? "this helper"}!
                </p>
              ) : (
                <div className="space-y-6">
                  {reviews.map((r, i) => (
                    <div key={r.id} className={i < reviews.length - 1 ? "pb-6 border-b border-outline-variant/30" : ""}>
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar name={r.student_name ?? "Student"} src={r.student_avatar_url ?? undefined} />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-on-surface">{r.student_name ?? "Student"}</span>
                            <span className="text-xs text-on-surface-variant">
                              {new Date(r.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                            </span>
                          </div>
                          <div className="flex items-center gap-0.5">
                            {[...Array(r.rating)].map((_, j) => (
                              <Star key={j} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            ))}
                          </div>
                        </div>
                      </div>
                      {r.comment && <p className="text-sm text-on-surface-variant leading-relaxed">{r.comment}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30">
              <h3 className="font-display font-bold text-on-surface mb-4">Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-on-surface-variant">
                    <Star className="w-4 h-4" />
                    Rating
                  </span>
                  <span className="text-sm font-semibold text-on-surface">{isNew ? "New" : rating.toFixed(1)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-on-surface-variant">
                    <MessageSquare className="w-4 h-4" />
                    Reviews
                  </span>
                  <span className="text-sm font-semibold text-on-surface">{reviews.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-on-surface-variant">
                    <Clock className="w-4 h-4" />
                    Active Tasks
                  </span>
                  <span className="text-sm font-semibold text-on-surface">{openOrdersCount ?? 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-on-surface-variant">
                    <BookOpen className="w-4 h-4" />
                    Completed
                  </span>
                  <span className="text-sm font-semibold text-on-surface">{completedOrdersCount ?? 0} tasks</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-on-surface-variant">
                    <GraduationCap className="w-4 h-4" />
                    Level
                  </span>
                  <span className="text-sm font-semibold text-on-surface">
                    {completedOrdersCount && completedOrdersCount >= 20 ? "Expert" : completedOrdersCount && completedOrdersCount >= 5 ? "Intermediate" : "Beginner"}
                  </span>
                </div>
              </div>
            </div>

            {/* Subjects */}
            {subjects.length > 0 && (
              <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30">
                <h3 className="font-display font-bold text-on-surface mb-3">Subjects</h3>
                <div className="flex flex-wrap gap-1.5">
                  {subjects.map((s) => (
                    <span key={s} className="px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container text-xs font-medium">{s}</span>
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="bg-primary-container/5 rounded-2xl p-6 border border-primary-container/20 space-y-3">
              <Link href="/contact" className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-container text-on-primary rounded-xl font-semibold text-sm hover:bg-primary transition-colors">
                Request Help
              </Link>
              <Link href="/browse-helpers" className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-outline-variant rounded-xl text-sm font-medium text-on-surface hover:bg-surface-container-low transition-colors">
                Browse Other Helpers
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}