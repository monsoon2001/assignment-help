import { CtaBand, PAGE_TONES, PageHeader } from "@/components/marketing/page-shell";
import { SUBJECTS, SERVICE_TYPES, ACADEMIC_LEVELS } from "@/lib/constants";
import { SUPPORTED_CURRENCIES } from "@/lib/currency";

const values = [
  { icon: "school", title: "Academic Integrity First", desc: "We believe in genuine learning. Our helpers guide and teach — they don't do the work for you. Every interaction is designed to build your understanding." },
  { icon: "verified_users", title: "Trust & Transparency", desc: "Every helper is verified, every price is upfront, and every policy is clear. We earn your trust through honest practices and open communication." },
  { icon: "diversity_3", title: "Inclusive Education", desc: "Quality academic support shouldn't be a privilege. We're committed to making expert peer guidance accessible and affordable for all students." },
  { icon: "eco", title: "Sustainable Growth", desc: "We invest in our helper community, ensuring fair compensation and continuous development so the quality of guidance keeps improving." },
];


const stats = [
  { value: String(SUBJECTS.length), label: "Subjects Covered" },
  { value: String(SERVICE_TYPES.length), label: "Types Of Help" },
  { value: String(ACADEMIC_LEVELS.length), label: "Academic Levels" },
  { value: String(SUPPORTED_CURRENCIES.length), label: "Currencies Supported" },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        tone="teal"
        icon="info"
        eyebrow="About Us"
        title="About Acadivo"
        subtitle="Building a better way for students to get academic guidance — peer-to-peer."
        crumbs={[{ label: "Home", href: "/" }, { label: "About Us" }]}
      />

      {/* Mission */}
      <section className="py-16 bg-white band-hero">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="w-16 h-16 mx-auto rounded-2xl bg-primary-fixed flex items-center justify-center mb-5">
              <span className="material-symbols-outlined text-primary text-3xl">emoji_objects</span>
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-on-surface mb-4">Our Mission</h2>
            <p className="text-on-surface-variant text-lg leading-relaxed max-w-2xl mx-auto">
              Acadivo exists to make quality academic support accessible to every student. We connect learners with verified peer helpers who provide genuine guidance — helping students understand concepts, improve their writing, and succeed academically on their own merit.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
            {stats.map((s) => {
              const tone = PAGE_TONES.blue;
              return (
              <div key={s.label} className="text-center bg-white rounded-2xl border border-outline-variant/30 shadow-sm px-4 py-6">
                <div className={`font-display text-3xl font-bold mb-1 ${tone.text}`}>{s.value}</div>
                <div className="text-sm text-on-surface-variant">{s.label}</div>
              </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 band-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-fixed text-primary text-sm font-semibold mb-3">
              <span className="material-symbols-outlined text-sm">volunteer_activism</span>
              Our Values
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-on-surface">What we hold ourselves to</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {values.map((v) => {
              const tone = PAGE_TONES.blue;
              return (
              <div key={v.title} className={`relative overflow-hidden rounded-2xl bg-white p-6 border ${tone.card} shadow-sm ${tone.cardHover} transition-all`}>
                <span className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${tone.hairline}`} aria-hidden="true" />
                <span className={`inline-flex w-12 h-12 rounded-xl items-center justify-center mb-4 ${tone.iconTile}`}>
                  <span className={`material-symbols-outlined ${tone.icon} text-3xl`}>{v.icon}</span>
                </span>
                <h3 className="font-display font-bold text-on-surface mb-2">{v.title}</h3>
                <p className="text-base text-on-surface-variant leading-relaxed">{v.desc}</p>
              </div>
              );
            })}
          </div>
        </div>
      </section>

      <CtaBand
        eyebrow="volunteer_activism"
        title="Join the Acadivo community"
        body="Whether you're a student seeking guidance or an expert wanting to help others, we'd love to have you."
        primary={{ label: "Browse Helpers", href: "/browse-helpers" }}
        secondary={{ label: "Contact Us", href: "/contact" }}
      />
    </>
  );
}
