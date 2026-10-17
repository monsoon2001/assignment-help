import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

// The configured Supabase project must be reachable from the browser both over
// HTTPS (REST / auth / storage) and WSS (realtime). Allow the exact origin in
// addition to the wildcard so self-hosted or custom domains keep working.
function supabaseOrigins(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return "";
  try {
    const parsed = new URL(url);
    return ` ${parsed.origin} wss://${parsed.host}`;
  } catch {
    return "";
  }
}

// Content-Security-Policy: blocks external script injection and framing while
// allowing what the app actually needs (Next inline bootstrapping, Supabase,
// Stripe Checkout/JS). See the seo/security notes in README.
const csp = [
  "default-src 'self'",
  // 'unsafe-eval' is only required by the dev bundler; production omits it.
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://js.stripe.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.googleusercontent.com https://*.ggpht.com https://images.unsplash.com",
  "font-src 'self' data:",
  `connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://r.stripe.com https://m.stripe.network${supabaseOrigins()}${isDev ? " ws://localhost:* http://localhost:*" : ""}`,
  "frame-src https://js.stripe.com https://hooks.stripe.com",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
  { key: "Content-Security-Policy", value: csp },
  {
    key: "Permissions-Policy",
    value: "camera=(), geolocation=(), microphone=(self)",
  },
];

// Authed and transactional areas carry no indexable content — the pages
// themselves also set `robots: noindex`, this header is the belt to that
// suspenders and covers client-rendered layouts (admin) that cannot export
// metadata.
const noIndexAreas = [
  "/admin/:path*",
  "/helper/:path*",
  "/dashboard/:path*",
  "/requests/:path*",
  "/orders/:path*",
  "/messages/:path*",
  "/notifications/:path*",
  "/profile/:path*",
  "/sign-in",
  "/sign-up",
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "**.googleusercontent.com" },
      { protocol: "https", hostname: "**.ggpht.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      ...noIndexAreas.map((source) => ({
        source,
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      })),
    ];
  },
};

export default nextConfig;
