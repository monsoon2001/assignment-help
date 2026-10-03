import Link from "next/link"
import { ChevronRight } from "lucide-react"

export const metadata = {
  title: "Programming Assignment Help | Acadibo",
  description: "Get expert programming assignment help for Python, Java, JavaScript, C++, and more. Debug code, understand logic, and learn faster.",
  alternates: { canonical: "https://acadibo.com/services/programming-help" },
  openGraph: {
    title: "Programming Assignment Help | Acadibo",
    description: "Step-by-step programming help from verified tutors for all languages.",
    type: "website",
    url: "https://acadibo.com/services/programming-help",
  },
}

export default function ProgrammingHelpPage() {
  return (
    <>
      <div className="bg-surface-container-high border-b border-outline-variant/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <nav className="flex items-center gap-2 text-sm text-on-surface-variant mb-4">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/services" className="hover:text-primary transition-colors">Services</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-on-surface font-medium">Programming Help</span>
          </nav>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-on-surface mb-2">Programming Assignment Help</h1>
          <p className="text-on-surface-variant max-w-2xl">Debugging, algorithms, data structures, and project guidance explained clearly.</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link href="/browse-helpers" className="inline-flex items-center gap-2 px-6 py-3 bg-primary-container text-on-primary rounded-xl font-semibold text-sm hover:bg-primary transition-colors">
          Find a Programming Helper
        </Link>
      </div>
    </>
  )
}
