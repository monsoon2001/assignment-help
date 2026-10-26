import Link from "next/link";
import { GraduationCap } from "lucide-react";

/**
 * Shared shell for the sign-in and sign-up pages: a calm, academic backdrop
 * with a single centred card, sized to the viewport so the forms fit without
 * scrolling on typical screens.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex h-dvh flex-col overflow-hidden bg-background">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-line" />

      <header className="relative z-10 flex shrink-0 items-center justify-between px-5 py-3 sm:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white shadow-sm">
            <GraduationCap size={18} />
          </span>
          <span className="font-display text-lg font-bold text-on-surface">Acadivo</span>
        </Link>
        <Link
          href="/"
          className="text-sm font-medium text-on-surface-variant transition-colors hover:text-on-surface"
        >
          Back to home
        </Link>
      </header>

      <main className="relative z-10 flex min-h-0 flex-1 justify-center overflow-y-auto px-4 py-4 sm:px-6">
        {children}
      </main>

      <footer className="relative z-10 shrink-0 px-5 py-3 text-center text-xs text-on-surface-variant sm:px-8">
        © {new Date().getFullYear()} Acadivo Academic Network · Verified peer helpers
      </footer>
    </div>
  );
}
