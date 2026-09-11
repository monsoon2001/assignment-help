This repo is a **PeerCraft** build — a peer-to-peer academic help platform on Next.js (App Router) + Supabase + Stripe, with student, helper, and admin areas, realtime chat, notifications, and order/review flows.

## Environment

Copy `.env.example` to `.env.local` and fill in your Supabase and Stripe (test-mode) values. Database migrations live in `supabase/migrations/` and are applied with:

```bash
psql "$DIRECT_URL" -v ON_ERROR_STOP=1 -f supabase/migrations/20260910000008_notifications.sql
```

## Verification

```bash
npx tsc --noEmit
npm run lint
npm run build
node scripts/test-proposal-flow.mjs
node scripts/test-order-flow.mjs
node scripts/test-phase7to10.mjs   # notifications + admin panel (Phase 7-10)
```

## Deploy on Vercel

1. Install the Vercel CLI and link the project (`vercel link`), or import the repo at https://vercel.com/new.
2. Set the following **Environment Variables** in the Vercel project (Production):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_JWKS_URL`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
3. Apply any not-yet-applied migrations to the production database before deploying.
4. Configure a Stripe webhook in the Stripe dashboard pointing to `https://<your-domain>/api/stripe/webhook` with the `checkout.session.completed` event, and set `STRIPE_WEBHOOK_SECRET` to that endpoint&apos;s signing secret.
5. While in test mode, keep test-mode Stripe keys. To go live, swap all Stripe keys and the webhook secret for live-mode values (settings page / admin panel reference them via env).
6. `vercel --prod` (auth/proxy conventions are already in `src/proxy.ts`; Realtime needs Supabase Realtime enabled — the `admin_messages` publication is added by migration `20260910000009_admin_panel.sql`).
# assignment-help
# assignment-help
