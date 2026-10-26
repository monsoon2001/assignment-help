import { SERVICE_PAGES } from "@/lib/services";

export type AccentStyle = {
  tile: string;
  icon: string;
  text: string;
  hairline: string;
  cardHover: string;
};

const ACCENTS = {
  indigo: {
    tile: "bg-tone-indigo-bg",
    icon: "text-tone-indigo",
    text: "text-tone-indigo",
    hairline: "bg-tone-indigo",
    cardHover: "hover:border-tone-indigo/40",
  },
  blue: {
    tile: "bg-tone-blue-bg",
    icon: "text-tone-blue",
    text: "text-tone-blue",
    hairline: "bg-tone-blue",
    cardHover: "hover:border-tone-blue/40",
  },
  slate: {
    tile: "bg-tone-slate-bg",
    icon: "text-tone-slate",
    text: "text-tone-slate",
    hairline: "bg-tone-slate",
    cardHover: "hover:border-tone-slate/40",
  },
  green: {
    tile: "bg-tone-green-bg",
    icon: "text-tone-green",
    text: "text-tone-green",
    hairline: "bg-tone-green",
    cardHover: "hover:border-tone-green/40",
  },
  orange: {
    tile: "bg-tone-orange-bg",
    icon: "text-tone-orange",
    text: "text-tone-orange",
    hairline: "bg-tone-orange",
    cardHover: "hover:border-tone-orange/40",
  },
  amber: {
    tile: "bg-tone-amber-bg",
    icon: "text-tone-amber",
    text: "text-tone-amber",
    hairline: "bg-tone-amber",
    cardHover: "hover:border-tone-amber/40",
  },
  primary: {
    tile: "bg-primary-tint",
    icon: "text-primary",
    text: "text-primary",
    hairline: "bg-primary",
    cardHover: "hover:border-primary/40",
  },
  red: {
    tile: "bg-tone-red-bg",
    icon: "text-tone-red",
    text: "text-tone-red",
    hairline: "bg-tone-red",
    cardHover: "hover:border-tone-red/40",
  },
  navy: {
    tile: "bg-primary-tint",
    icon: "text-primary-dark",
    text: "text-primary-dark",
    hairline: "bg-primary-dark",
    cardHover: "hover:border-primary-dark/40",
  },
  teal: {
    tile: "bg-tone-teal-bg",
    icon: "text-tone-teal",
    text: "text-tone-teal",
    hairline: "bg-tone-teal",
    cardHover: "hover:border-tone-teal/40",
  },
  purple: {
    tile: "bg-tone-purple-bg",
    icon: "text-tone-purple",
    text: "text-tone-purple",
    hairline: "bg-tone-purple",
    cardHover: "hover:border-tone-purple/40",
  },
  rose: {
    tile: "bg-tone-rose-bg",
    icon: "text-tone-rose",
    text: "text-tone-rose",
    hairline: "bg-tone-rose",
    cardHover: "hover:border-tone-rose/40",
  },
  cyan: {
    tile: "bg-tone-cyan-bg",
    icon: "text-tone-cyan",
    text: "text-tone-cyan",
    hairline: "bg-tone-cyan",
    cardHover: "hover:border-tone-cyan/40",
  },
  lime: {
    tile: "bg-tone-lime-bg",
    icon: "text-tone-lime",
    text: "text-tone-lime",
    hairline: "bg-tone-lime",
    cardHover: "hover:border-tone-lime/40",
  },
  pink: {
    tile: "bg-tone-pink-bg",
    icon: "text-tone-pink",
    text: "text-tone-pink",
    hairline: "bg-tone-pink",
    cardHover: "hover:border-tone-pink/40",
  },
  violet: {
    tile: "bg-tone-violet-bg",
    icon: "text-tone-violet",
    text: "text-tone-violet",
    hairline: "bg-tone-violet",
    cardHover: "hover:border-tone-violet/40",
  },
  sky: {
    tile: "bg-tone-sky-bg",
    icon: "text-tone-sky",
    text: "text-tone-sky",
    hairline: "bg-tone-sky",
    cardHover: "hover:border-tone-sky/40",
  },
  fuchsia: {
    tile: "bg-tone-fuchsia-bg",
    icon: "text-tone-fuchsia",
    text: "text-tone-fuchsia",
    hairline: "bg-tone-fuchsia",
    cardHover: "hover:border-tone-fuchsia/40",
  },
  yellow: {
    tile: "bg-tone-yellow-bg",
    icon: "text-tone-yellow",
    text: "text-tone-yellow",
    hairline: "bg-tone-yellow",
    cardHover: "hover:border-tone-yellow/40",
  },
  emerald: {
    tile: "bg-tone-emerald-bg",
    icon: "text-tone-emerald",
    text: "text-tone-emerald",
    hairline: "bg-tone-emerald",
    cardHover: "hover:border-tone-emerald/40",
  },
} satisfies Record<string, AccentStyle>;

type AccentKey = keyof typeof ACCENTS;

const ACCENT_KEYS = [
  "indigo",
  "blue",
  "slate",
  "green",
  "orange",
  "amber",
  "red",
  "teal",
  "purple",
  "rose",
  "cyan",
  "lime",
  "pink",
  "violet",
  "sky",
  "fuchsia",
  "yellow",
  "emerald",
] as const satisfies readonly AccentKey[];

const SUBJECT_ACCENT_KEYS: Record<string, AccentKey> = {
  "english-literature": "indigo",
  mathematics: "blue",
  statistics: "slate",
  biology: "green",
  chemistry: "orange",
  physics: "amber",
  "computer-science": "cyan",
  engineering: "red",
  "academic-writing": "pink",
  "business-studies": "emerald",
  psychology: "violet",
  economics: "lime",
  history: "rose",
  philosophy: "teal",
  sociology: "sky",
  "political-science": "fuchsia",
  nursing: "yellow",
};

const GUIDE_CATEGORY_ACCENT_KEYS: Record<string, AccentKey> = {
  writing: "indigo",
  research: "green",
  citations: "orange",
  projects: "red",
  technical: "amber",
  presentations: "slate",
};

const FEATURED_GUIDE_ACCENT_KEYS: Record<string, AccentKey> = {
  "how-to-write-a-report": "rose",
  "how-to-write-a-lab-report": "teal",
  "how-to-cite-sources": "purple",
};

function hashKey(key: string) {
  let hash = 0;
  for (const char of key) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return hash;
}

function accentAt(index: number) {
  return ACCENTS[ACCENT_KEYS[((index % ACCENT_KEYS.length) + ACCENT_KEYS.length) % ACCENT_KEYS.length]];
}

export function accentForIndex(index: number) {
  return accentAt(index);
}

export function accentForSubject(slug: string): AccentStyle {
  const key = SUBJECT_ACCENT_KEYS[slug];
  return key ? ACCENTS[key] : accentAt(hashKey(slug));
}

export function accentForGuideCategory(slug: string): AccentStyle {
  const key = GUIDE_CATEGORY_ACCENT_KEYS[slug];
  return key ? ACCENTS[key] : accentAt(hashKey(slug));
}

export function accentForFeaturedGuide(slug: string, category: string): AccentStyle {
  const key = FEATURED_GUIDE_ACCENT_KEYS[slug];
  return key ? ACCENTS[key] : accentForGuideCategory(category);
}

const SERVICE_ACCENT_BY_SLUG = new Map(
  SERVICE_PAGES.map((service, index) => [service.slug, accentAt(index)]),
);

export function accentForService(slug: string): AccentStyle {
  return SERVICE_ACCENT_BY_SLUG.get(slug) ?? accentAt(hashKey(slug));
}

/** Links inside subject and service cards stay one dark blue shade. */
export const DARK_LINK = "text-primary-dark";
