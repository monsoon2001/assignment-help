import Link from "next/link";
import { ChevronRight } from "lucide-react";

const subjectGroups = [
  { category: "Humanities & Liberal Arts", subjects: [
    { name: "English Literature", desc: "Literary analysis, critical essays, poetry, and prose interpretation", icon: "menu_book" },
    { name: "History", desc: "World history, American history, historiography, and source analysis", icon: "history_edu" },
    { name: "Philosophy", desc: "Ethics, logic, political philosophy, and critical thinking", icon: "psychology" },
    { name: "Sociology", desc: "Social theory, research methods, and contemporary social issues", icon: "groups" },
    { name: "Political Science", desc: "Political theory, international relations, and public policy", icon: "gavel" },
  ]},
  { category: "Sciences & STEM", subjects: [
    { name: "Biology", desc: "Cell biology, genetics, ecology, anatomy, and lab reports", icon: "biotech" },
    { name: "Chemistry", desc: "Organic, inorganic, physical chemistry, and lab methodology", icon: "science" },
    { name: "Physics", desc: "Classical mechanics, thermodynamics, electromagnetism, and quantum theory", icon: "settings_input_antenna" },
    { name: "Mathematics", desc: "Algebra, calculus, geometry, number theory, and applied math", icon: "calculate" },
    { name: "Statistics", desc: "Probability, data analysis, hypothesis testing, and regression", icon: "bar_chart" },
    { name: "Computer Science", desc: "Programming, algorithms, data structures, and software engineering", icon: "code" },
    { name: "Engineering", desc: "Mechanical, civil, electrical engineering principles and design", icon: "precision_manufacturing" },
  ]},
  { category: "Business & Social Sciences", subjects: [
    { name: "Economics", desc: "Microeconomics, macroeconomics, econometrics, and policy analysis", icon: "trending_up" },
    { name: "Business Studies", desc: "Management, marketing, finance, and strategic planning", icon: "business_center" },
    { name: "Psychology", desc: "Cognitive, developmental, clinical, and social psychology", icon: "psychology_alt" },
    { name: "Nursing", desc: "Nursing theory, patient care, pharmacology, and clinical practice", icon: "local_hospital" },
  ]},
];

export default function SubjectsPage() {
  return (
    <>
      <div className="bg-surface-container-high border-b border-outline-variant/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <nav className="flex items-center gap-2 text-sm text-on-surface-variant mb-4">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-on-surface font-medium">Subjects</span>
          </nav>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-on-surface mb-2">Subjects We Cover</h1>
          <p className="text-on-surface-variant max-w-2xl">Expert guidance across a wide range of academic disciplines — from humanities to STEM and beyond.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {subjectGroups.map((group) => (
          <div key={group.category} className="mb-16 last:mb-0">
            <h2 className="font-display text-2xl font-bold text-on-surface mb-6">{group.category}</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {group.subjects.map((s) => (
                <Link
                  key={s.name}
                  href={`/browse-helpers?subject=${encodeURIComponent(s.name)}`}
                  className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30 hover:shadow-md hover:border-primary-container/30 transition-all group"
                >
                  <div className="w-12 h-12 bg-primary-container/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-container/20 transition-colors">
                    <span className="material-symbols-outlined text-primary">{s.icon}</span>
                  </div>
                  <h3 className="font-display font-bold text-on-surface mb-2">{s.name}</h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed">{s.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <section className="bg-surface-container-high border-t border-outline-variant/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h2 className="font-display text-2xl font-bold text-on-surface mb-3">Don&apos;t see your subject?</h2>
          <p className="text-on-surface-variant mb-6">We&apos;re always expanding. Contact us and we&apos;ll do our best to find a helper for your specific subject.</p>
          <Link href="/contact" className="inline-flex items-center gap-2 px-6 py-3 bg-primary-container text-on-primary rounded-xl font-semibold text-sm hover:bg-primary transition-colors">
            Contact Us
          </Link>
        </div>
      </section>
    </>
  );
}
