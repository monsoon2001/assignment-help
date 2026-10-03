import Link from "next/link"
import { ChevronRight } from "lucide-react"

export const metadata = {
  title: "Computer Science Assignment Help & Tutoring | Acadibo",
  description: "Get expert computer science assignment help with programming, algorithms, data structures, and more. Connect with verified CS tutors today.",
  alternates: { canonical: "https://acadibo.com/subjects/computer-science" },
  openGraph: {
    title: "Computer Science Assignment Help & Tutoring | Acadibo",
    description: "Get expert CS help with programming, algorithms, data structures, debugging, and projects.",
    type: "website",
    url: "https://acadibo.com/subjects/computer-science",
  },
}

export default function ComputerSciencePage() {
  return (
    <>
      <div className="bg-surface-container-high border-b border-outline-variant/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <nav className="flex items-center gap-2 text-sm text-on-surface-variant mb-4">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/subjects" className="hover:text-primary transition-colors">Subjects</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-on-surface font-medium">Computer Science</span>
          </nav>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-on-surface mb-2">
            Computer Science Assignment Help & Tutoring
          </h1>
          <p className="text-on-surface-variant max-w-2xl">
            Get step-by-step help with programming assignments, algorithms, data structures, and CS concepts.
          </p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose max-w-none">
          <h2>Need help with computer science assignments?</h2>
          <p>
            Our verified CS mentors can help you understand programming concepts, debug code, and complete assignments
            while learning the underlying logic.
          </p>
          <Link href="/browse-helpers" className="inline-flex items-center gap-2 px-6 py-3 bg-primary-container text-on-primary rounded-xl font-semibold text-sm hover:bg-primary transition-colors mt-6">
            Find a CS Helper
          </Link>
        </div>
      </div>
    </>
  )
}
