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
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-28 h-72 w-72 rounded-full bg-primary-fixed opacity-80 blur-3xl" />
        <div className="absolute -bottom-32 -right-24 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,0.07),transparent_55%)]" />
      </div>

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
