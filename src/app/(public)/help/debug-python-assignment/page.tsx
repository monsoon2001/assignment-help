import Link from "next/link"
import { ChevronRight } from "lucide-react"

export const metadata = {
  title: "How to Debug a Python Assignment | Acadivo",
  description: "Learn practical steps to debug your Python assignment with tips, tools, and strategies. Get help when you're stuck.",
  alternates: { canonical: "https://acadivo.com/help/debug-python-assignment" },
  openGraph: {
    title: "How to Debug a Python Assignment | Acadivo",
    description: "Practical debugging tips for Python assignments to help you fix errors faster.",
    type: "article",
    url: "https://acadivo.com/help/debug-python-assignment",
  },
}

export default function DebugPythonPage() {
  return (
    <>
      <div className="bg-gradient-to-r from-primary-fixed/50 via-white to-white border-b border-outline-variant/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <nav className="flex items-center gap-2 text-sm text-on-surface-variant mb-4">
            <Link href="/" className="text-primary transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/browse-helpers" className="text-primary transition-colors">Help</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-on-surface font-medium">Debug a Python Assignment</span>
          </nav>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-on-surface mb-2">
            How to Debug a Python Assignment
          </h1>
          <p className="text-on-surface-variant max-w-2xl">
            Practical, beginner-friendly steps to find and fix bugs in your Python code.
          </p>
        </div>
      </div>
      <div className="band-soft">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 prose">
        <h2>Step-by-step debugging</h2>
        <ol>
          <li>Read the error message carefully</li>
          <li>Reproduce the issue</li>
          <li>Use print statements or a debugger</li>
          <li>Test small chunks of code</li>
          <li>Fix one issue at a time</li>
        </ol>
        <p>Still stuck? Get personalized help from a verified Python tutor.</p>
        <Link href="/browse-helpers" className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-container text-white rounded-xl font-semibold text-sm hover:opacity-95 transition-opacity no-underline">
          Get Python Help
        </Link>
      </div>
      </div>
    </>
  )
}
