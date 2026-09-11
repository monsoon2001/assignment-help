import Link from "next/link";
import { ChevronRight } from "lucide-react";

const values = [
  { icon: "school", title: "Academic Integrity First", desc: "We believe in genuine learning. Our helpers guide and teach — they don't do the work for you. Every interaction is designed to build your understanding." },
  { icon: "verified_users", title: "Trust & Transparency", desc: "Every helper is verified, every price is upfront, and every policy is clear. We earn your trust through honest practices and open communication." },
  { icon: "diversity_3", title: "Inclusive Education", desc: "Quality academic support shouldn't be a privilege. We're committed to making expert peer guidance accessible and affordable for all students." },
  { icon: "eco", title: "Sustainable Growth", desc: "We invest in our helper community, ensuring fair compensation and continuous development so the quality of guidance keeps improving." },
];

const team = [
  { name: "Alex Chen", role: "Founder & CEO", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face", bio: "Former tutor who saw the need for a better academic support platform." },
  { name: "Sarah Kim", role: "Head of Quality", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face", bio: "PhD in Education, ensuring every helper meets our high standards." },
  { name: "Marcus Williams", role: "Head of Community", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face", bio: "Building and nurturing our community of verified peer helpers." },
];

const stats = [
  { value: "2,000+", label: "Students Served" },
  { value: "150+", label: "Verified Helpers" },
  { value: "4.9", label: "Average Rating" },
  { value: "98%", label: "On-Time Delivery" },
];

export default function AboutPage() {
  return (
    <>
      <div className="bg-surface-container-high border-b border-outline-variant/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <nav className="flex items-center gap-2 text-sm text-on-surface-variant mb-4">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-on-surface font-medium">About Us</span>
          </nav>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-on-surface mb-2">About PeerCraft</h1>
          <p className="text-on-surface-variant max-w-2xl">Building a better way for students to get academic guidance — peer-to-peer.</p>
        </div>
      </div>

      {/* Mission */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="material-symbols-outlined text-primary text-4xl mb-4 block">emoji_objects</span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-on-surface mb-4">Our Mission</h2>
            <p className="text-on-surface-variant text-lg leading-relaxed max-w-2xl mx-auto">
              PeerCraft exists to make quality academic support accessible to every student. We connect learners with verified peer helpers who provide genuine guidance — helping students understand concepts, improve their writing, and succeed academically on their own merit.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="font-display text-3xl font-bold text-primary mb-1">{s.value}</div>
                <div className="text-sm text-on-surface-variant">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-surface-container-low">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-on-surface text-center mb-10">Our Values</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {values.map((v) => (
              <div key={v.title} className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30">
                <span className="material-symbols-outlined text-primary text-3xl mb-4 block">{v.icon}</span>
                <h3 className="font-display font-bold text-on-surface mb-2">{v.title}</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-on-surface text-center mb-10">Meet The Team</h2>
          <div className="grid sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
            {team.map((t) => (
              <div key={t.name} className="text-center">
                <img src={t.avatar} alt={t.name} className="w-20 h-20 rounded-full object-cover mx-auto mb-4" />
                <h3 className="font-display font-bold text-on-surface">{t.name}</h3>
                <p className="text-sm text-primary font-medium mb-2">{t.role}</p>
                <p className="text-sm text-on-surface-variant">{t.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-surface-container-high">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-2xl font-bold text-on-surface mb-3">Join the PeerCraft community</h2>
          <p className="text-on-surface-variant mb-6">Whether you&apos;re a student seeking guidance or an expert wanting to help others, we&apos;d love to have you.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/browse-helpers" className="px-6 py-3 bg-primary-container text-on-primary rounded-xl font-semibold text-sm hover:bg-primary transition-colors">Browse Helpers</Link>
            <Link href="/contact" className="px-6 py-3 border border-outline-variant rounded-xl font-semibold text-sm text-on-surface hover:bg-surface-container-low transition-colors">Contact Us</Link>
          </div>
        </div>
      </section>
    </>
  );
}
