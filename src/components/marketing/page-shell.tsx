import Link from "next/link";
import { ChevronRight, ArrowRight } from "lucide-react";
import { MaterialIcon } from "@/lib/icons-map";

/**
 * Every public page shares the same page-header band, section bands and
 * closing call-to-action. Sections stay neutral (white / soft grey); each page
 * carries one non-purple accent (blue, teal, green, amber or rose) used only
 * in small touches — icon tiles, chips, hairlines, links and hover states —
 * so a long marketing page reads as one calm sheet of colour, never washes.
 */
export type PageTone = "blue" | "teal" | "green" | "amber" | "rose";

type ToneTokens = {
  /** Page-header band: a quiet neutral sheet — colour stays in the hairline,
   *  icon tile, chip and links, never a full-colour wash. */
  header: string;
  /** Accent name used for links, chips and icons in this page's header. */
  text: string;
  /** Full literal hover variant — Tailwind cannot build this from a template. */
  hoverText: string;
  chip: string;
  iconTile: string;
  icon: string;
  /** Soft tile behind the page's accent icon. */
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
  header: "bg-gradient-to-b from-surface-container-low/60 to-surface-container-lowest",
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
  header: "bg-gradient-to-b from-surface-container-low/60 to-surface-container-lowest",
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
  header: "bg-gradient-to-b from-surface-container-low/60 to-surface-container-lowest",
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
  header: "bg-gradient-to-b from-surface-container-low/60 to-surface-container-lowest",
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
  header: "bg-gradient-to-b from-surface-container-low/60 to-surface-container-lowest",
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

/** Compact breadcrumb + title band shared by every public page (no hero). */
export function PageHeader({
  title,
  subtitle,
  crumbs = [{ label: "Home", href: "/" }],
}: {
  title: string;
  subtitle?: string;
  crumbs?: Crumb[];
}) {
  return (
    <div className="border-b border-outline-variant/40 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-6">
        <nav className="flex items-center gap-1.5 text-sm mb-3" aria-label="Breadcrumb">
          {crumbs.map((crumb, i) => (
            <span key={`${crumb.label}-${i}`} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight className="w-3 h-3 text-outline-variant" />}
              {crumb.href ? (
                <Link href={crumb.href} className={`text-on-surface-variant transition-colors inline-flex items-center min-h-11 min-w-11`}>
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-on-surface font-medium truncate max-w-[14rem] inline-block">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>

        <h1 className="font-display text-2xl sm:text-3xl font-bold text-on-surface leading-tight max-w-3xl">
          {title}
        </h1>

        {subtitle && (
          <p className="mt-2 text-base text-on-surface-variant max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        )}
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
            <MaterialIcon name={eyebrow} size={14} className="text-white/70" />
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