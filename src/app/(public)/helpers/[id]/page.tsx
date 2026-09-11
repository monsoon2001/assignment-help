import Link from "next/link";
import { ChevronRight, Star, Clock, MessageSquare, Award, BookOpen } from "lucide-react";

const helper = {
  id: "maya-r",
  name: "Maya R.",
  avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face",
  rating: 4.9,
  reviews: 127,
  verified: true,
  bio: "Published literary analyst with expertise in essay structure, thesis development, and MLA/APA formatting. I help you find your voice while mastering academic conventions. With over 3 years of tutoring experience, I've guided hundreds of students through everything from first-year composition to advanced literary criticism.",
  longBio: "I believe every student has a unique perspective — my job is to help you express it clearly and convincingly. Whether you're struggling with thesis statements, need help organizing your argument, or want to polish your citations, I'm here to guide you through the process step by step. I specialize in literary analysis, critical essays, and research papers, with deep knowledge of MLA, APA, and Chicago citation styles.",
  subjects: ["English Literature", "Essay Writing", "Creative Writing", "Research Papers", "MLA/APA Formatting"],
  stats: { onTime: "98%", avgReply: "< 1 hour", completedTasks: 127, satisfactionRate: "99%" },
  education: "B.A. English Literature, University of California",
  specialties: ["Thesis Development", "Literary Analysis", "MLA/APA Formatting", "Critical Essays", "Research Methodology"],
  availability: "Available Mon-Sat, usually responds within 1 hour",
};

const reviews = [
  { name: "Alex M.", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face", rating: 5, text: "Maya helped me structure my thesis argument beautifully. The step-by-step feedback was invaluable — I learned more in one session than in weeks of struggling alone.", date: "2 weeks ago" },
  { name: "Jessica T.", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face", rating: 5, text: "Incredible attention to detail. Maya didn't just fix my grammar — she helped me understand why my argument wasn't working and how to rebuild it. My essay went from a C to an A.", date: "1 month ago" },
  { name: "Ryan K.", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face", rating: 5, text: "Best MLA formatting help I've ever received. Maya caught citation errors I would have never noticed and explained the rules clearly. Highly recommend for any English Lit student.", date: "3 weeks ago" },
];

export default function HelperProfilePage() {
  return (
    <>
      <div className="bg-surface-container-high border-b border-outline-variant/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <nav className="flex items-center gap-2 text-sm text-on-surface-variant mb-4">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/browse-helpers" className="hover:text-primary transition-colors">Helpers</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-on-surface font-medium">{helper.name}</span>
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
                <img src={helper.avatar} alt={helper.name} className="w-24 h-24 rounded-full object-cover shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="font-display text-2xl font-bold text-on-surface">{helper.name}</h1>
                    {helper.verified && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-container/10 text-primary text-xs font-semibold">
                        <span className="material-symbols-outlined text-sm">verified</span>
                        Verified
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                      <span className="text-sm font-semibold text-on-surface ml-1">{helper.rating}</span>
                    </div>
                    <span className="text-sm text-on-surface-variant">({helper.reviews} reviews)</span>
                  </div>
                  <p className="text-sm text-on-surface-variant mb-3">{helper.education}</p>
                  <p className="text-sm text-on-surface-variant leading-relaxed">{helper.bio}</p>
                </div>
              </div>
            </div>

            {/* About */}
            <div className="bg-surface-container-lowest rounded-2xl p-8 border border-outline-variant/30">
              <h2 className="font-display text-lg font-bold text-on-surface mb-4">About {helper.name}</h2>
              <p className="text-sm text-on-surface-variant leading-relaxed">{helper.longBio}</p>
            </div>

            {/* Specialties */}
            <div className="bg-surface-container-lowest rounded-2xl p-8 border border-outline-variant/30">
              <h2 className="font-display text-lg font-bold text-on-surface mb-4">Specialties</h2>
              <div className="flex flex-wrap gap-2">
                {helper.specialties.map((s) => (
                  <span key={s} className="px-3 py-1.5 rounded-full bg-secondary-container text-on-secondary-container text-sm font-medium">{s}</span>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-surface-container-lowest rounded-2xl p-8 border border-outline-variant/30">
              <h2 className="font-display text-lg font-bold text-on-surface mb-6">Reviews</h2>
              <div className="space-y-6">
                {reviews.map((r, i) => (
                  <div key={i} className={i < reviews.length - 1 ? "pb-6 border-b border-outline-variant/30" : ""}>
                    <div className="flex items-center gap-3 mb-3">
                      <img src={r.avatar} alt={r.name} className="w-10 h-10 rounded-full object-cover" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-on-surface">{r.name}</span>
                          <span className="text-xs text-on-surface-variant">{r.date}</span>
                        </div>
                        <div className="flex items-center gap-0.5">
                          {[...Array(r.rating)].map((_, j) => (
                            <Star key={j} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-on-surface-variant leading-relaxed">{r.text}</p>
                  </div>
                ))}
              </div>
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
                    <Clock className="w-4 h-4" />
                    On-Time Rate
                  </span>
                  <span className="text-sm font-semibold text-on-surface">{helper.stats.onTime}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-on-surface-variant">
                    <MessageSquare className="w-4 h-4" />
                    Avg Reply
                  </span>
                  <span className="text-sm font-semibold text-on-surface">{helper.stats.avgReply}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-on-surface-variant">
                    <BookOpen className="w-4 h-4" />
                    Completed
                  </span>
                  <span className="text-sm font-semibold text-on-surface">{helper.stats.completedTasks} tasks</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-on-surface-variant">
                    <Award className="w-4 h-4" />
                    Satisfaction
                  </span>
                  <span className="text-sm font-semibold text-on-surface">{helper.stats.satisfactionRate}</span>
                </div>
              </div>
            </div>

            {/* Subjects */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30">
              <h3 className="font-display font-bold text-on-surface mb-3">Subjects</h3>
              <div className="flex flex-wrap gap-1.5">
                {helper.subjects.map((s) => (
                  <span key={s} className="px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container text-xs font-medium">{s}</span>
                ))}
              </div>
            </div>

            {/* Availability */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30">
              <h3 className="font-display font-bold text-on-surface mb-3">Availability</h3>
              <p className="text-sm text-on-surface-variant">{helper.availability}</p>
            </div>

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
