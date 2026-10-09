import Link from "next/link"
import { PageHeader } from "@/components/marketing/page-shell"

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
      <PageHeader
        title="How to Debug a Python Assignment"
        subtitle="Practical, beginner-friendly steps to find and fix bugs in your Python code."
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Help" },
          { label: "Debug a Python Assignment" },
        ]}
      />
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
