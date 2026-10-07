import Link from "next/link";
import { ChevronRight, ArrowRight } from "lucide-react";

/**
 * Every public page shares the same page-header band, section bands and
 * closing call-to-action. Sections stay neutral (white / soft grey); each page
 * carries one non-purple accent (blue, teal, green, amber or rose) used only
 * in small touches — icon tiles, chips, hairlines, links and hover states —
 * so a long marketing page reads as one calm sheet of colour, never washes.
 */
export type PageTone = "blue" | "teal" | "green" | "amber" | "rose";

type ToneTokens = {
  /** Page-header band: white with a faint tint of the page's accent at the left. */
  header: string;
  /** Accent name used for links, chips and icons in this page's header. */
  text: string;
  /** Full literal hover variant — Tailwind cannot build this from a template. */
  hoverText: string;
  chip: string;
  iconTile: string;
  icon: string;
  /** Soft tile behind a material-symbols icon. */
  card: string;
  cardHover: string;
  /** Section background: soft neutral grey (pairs with plain `bg-white`). */
  band: string;
  /** Primary buttons stay one brand blue across every page for cohesion. */
  button: string;
  /** `from-* to-*` only, for buttons that add their own gradient utility. */
  btn: string;
  hairline: string;
};

const BLUE_TONE: ToneTokens = {
  header: "bg-gradient-to-r from-primary-fixed/60 via-white to-white",
  text: "text-primary",
  hoverText: "hover:text-primary",
  chip: "bg-primary-fixed text-on-primary-fixed",
  iconTile: "bg-primary-fixed",
  icon: "text-primary",
  card: "border-outline-variant/40",
  cardHover: "hover:border-primary-container/50 hover:shadow-md",
  band: "band-soft",
  button: "bg-primary hover:bg-primary-container text-white transition-colors",
  btn: "from-primary-container to-primary",
  hairline: "from-primary-container to-primary-fixed",
};

const TEAL_TONE: ToneTokens = {
  header: "bg-gradient-to-r from-accent-teal-container/80 via-white to-white",
  text: "text-accent-teal",
  hoverText: "hover:text-accent-teal",
  chip: "bg-accent-teal-container text-accent-teal",
  iconTile: "bg-accent-teal-container",
  icon: "text-accent-teal",
  card: "border-outline-variant/40",
  cardHover: "hover:border-accent-teal/35 hover:shadow-md",
  band: "band-soft",
  button: "bg-primary hover:bg-primary-container text-white transition-colors",
  btn: "from-primary-container to-primary",
  hairline: "from-accent-teal to-accent-teal-container",
};

const GREEN_TONE: ToneTokens = {
  header: "bg-gradient-to-r from-accent-green-container/80 via-white to-white",
  text: "text-accent-green",
  hoverText: "hover:text-accent-green",
  chip: "bg-accent-green-container text-accent-green",
  iconTile: "bg-accent-green-container",
  icon: "text-accent-green",
  card: "border-outline-variant/40",
  cardHover: "hover:border-accent-green/35 hover:shadow-md",
  band: "band-soft",
  button: "bg-primary hover:bg-primary-container text-white transition-colors",
  btn: "from-primary-container to-primary",
  hairline: "from-accent-green to-accent-green-container",
};

const AMBER_TONE: ToneTokens = {
  header: "bg-gradient-to-r from-accent-amber-container/80 via-white to-white",
  text: "text-accent-amber",
  hoverText: "hover:text-accent-amber",
  chip: "bg-accent-amber-container text-accent-amber",
  iconTile: "bg-accent-amber-container",
  icon: "text-accent-amber",
  card: "border-outline-variant/40",
  cardHover: "hover:border-accent-amber/40 hover:shadow-md",
  band: "band-soft",
  button: "bg-primary hover:bg-primary-container text-white transition-colors",
  btn: "from-primary-container to-primary",
  hairline: "from-accent-amber to-accent-amber-container",
};

const ROSE_TONE: ToneTokens = {
  header: "bg-gradient-to-r from-accent-rose-container/80 via-white to-white",
  text: "text-accent-rose",
  hoverText: "hover:text-accent-rose",
  chip: "bg-accent-rose-container text-accent-rose",
  iconTile: "bg-accent-rose-container",
  icon: "text-accent-rose",
  card: "border-outline-variant/40",
  cardHover: "hover:border-accent-rose/35 hover:shadow-md",
  band: "band-soft",
  button: "bg-primary hover:bg-primary-container text-white transition-colors",
  btn: "from-primary-container to-primary",
  hairline: "from-accent-rose to-accent-rose-container",
};

export const PAGE_TONES: Record<PageTone, ToneTokens> = {
  blue: BLUE_TONE,
  teal: TEAL_TONE,
  green: GREEN_TONE,
  amber: AMBER_TONE,
  rose: ROSE_TONE,
};

/** Non-purple accents in rotation, so list cards pick up varied colour. */
export const TONE_CYCLE: PageTone[] = ["blue", "teal", "green", "amber", "rose"];

export type Crumb = { label: string; href?: string };

/** Breadcrumb + title band shared by every public page. */
export function PageHeader({
  title,
  subtitle,
  crumbs = [{ label: "Home", href: "/" }],
  tone = "blue",
  icon,
  eyebrow,
}: {
  title: string;
  subtitle?: string;
  crumbs?: Crumb[];
  tone?: PageTone;
  icon?: string;
  eyebrow?: string;
}) {
  const t = PAGE_TONES[tone];
  return (
    <div className={`${t.header} border-b border-outline-variant/50`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <nav className="flex items-center gap-2 text-sm text-on-surface-variant mb-4">
          {crumbs.map((crumb, i) => (
            <span key={`${crumb.label}-${i}`} className="flex items-center gap-2">
              {i > 0 && <ChevronRight className="w-3.5 h-3.5" />}
              {crumb.href ? (
                <Link href={crumb.href} className={`${t.hoverText} transition-colors`}>
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-on-surface font-medium">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
        {(icon || eyebrow) && (
          <div className="flex items-center gap-3 mb-3">
            {icon && (
              <span className={`w-11 h-11 rounded-xl ${t.iconTile} flex items-center justify-center shrink-0`}>
                <span className={`material-symbols-outlined ${t.icon} text-xl`}>{icon}</span>
              </span>
            )}
            {eyebrow && (
              <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${t.chip}`}>
                {eyebrow}
              </span>
            )}
          </div>
        )}
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-on-surface mb-2">{title}</h1>
        {subtitle && <p className="text-on-surface-variant max-w-3xl">{subtitle}</p>}
      </div>
    </div>
  );
}

/** Dark closing band that bookends each marketing page. */
export function CtaBand({
  title,
  body,
  primary,
  secondary,
  eyebrow,
}: {
  title: string;
  body: string;
  primary: { label: string; href: string };
  secondary?: { label: string; href: string };
  eyebrow?: string;
}) {
  return (
    <section className="relative overflow-hidden py-16 band-ink" aria-labelledby="cta-heading">
      <div className="absolute inset-0 band-ink-grid" aria-hidden="true" />
      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {eyebrow && (
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full on-band-chip border text-xs font-semibold mb-4">
            <span className="material-symbols-outlined text-sm text-white/70">{eyebrow}</span>
          </span>
        )}
        <h2 id="cta-heading" className="font-display text-2xl sm:text-3xl font-bold text-white mb-3">
          {title}
        </h2>
        <p className="on-band-muted mb-7 leading-relaxed">{body}</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href={primary.href}
            className="inline-flex items-center gap-2 px-7 py-3 bg-white text-ink-900 rounded-xl font-semibold text-sm hover:bg-white/90 transition-colors shadow-lg shadow-ink-900/40"
          >
            {primary.label}
            <ArrowRight className="w-4 h-4" />
          </Link>
          {secondary && (
            <Link
              href={secondary.href}
              className="inline-flex items-center px-7 py-3 border border-white/35 rounded-xl font-semibold text-sm text-white hover:bg-white/10 transition-colors"
            >
              {secondary.label}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}