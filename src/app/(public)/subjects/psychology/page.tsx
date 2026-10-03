import Link from "next/link"
import { ChevronRight } from "lucide-react"

export const metadata = {
  title: "Psychology Assignment Help & Tutoring | Acadibo",
  description: "Get expert psychology assignment help with research papers, case studies, and psychological concepts.",
  alternates: { canonical: "https://acadibo.com/subjects/psychology" },
  openGraph: {
    title: "Psychology Assignment Help & Tutoring | Acadibo",
    description: "Guidance for psychology essays, research, and concepts.",
    type: "website",
    url: "https://acadibo.com/subjects/psychology",
  },
}

export default function PsychologyPage() {
  return (
    <>
      <div className="bg-surface-container-high border-b border-outline-variant/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <nav className="flex items-center gap-2 text-sm text-on-surface-variant mb-4">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/subjects" className="hover:text-primary transition-colors">Subjects</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-on-surface font-medium">Psychology</span>
          </nav>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-on-surface mb-2">
            Psychology Assignment Help & Tutoring
          </h1>
          <p className="text-on-surface-variant max-w-2xl">
            Clear, structured help for psychology essays, reports, and exam prep.
          </p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link href="/browse-helpers" className="inline-flex items-center gap-2 px-6 py-3 bg-primary-container text-on-primary rounded-xl font-semibold text-sm hover:bg-primary transition-colors">
          Find a Psychology Helper
        </Link>
      </div>
    </>
  )
}
