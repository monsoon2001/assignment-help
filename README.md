This repo is an **Acadivo** build — a peer-to-peer academic help platform on Next.js (App Router) + Supabase + Stripe, with student, helper, and admin areas, realtime chat, notifications, and order/review flows.

## Environment

Copy `.env.example` to `.env.local` and fill in your Supabase and Stripe (test-mode) values. Database migrations live in `supabase/migrations/` and are applied with:

```bash
psql "$DIRECT_URL" -v ON_ERROR_STOP=1 -f supabase/migrations/20260910000008_notifications.sql
```

## Email verification (verification code, not a link)

Sign-up uses `supabase.auth.signInWithOtp` and then `verifyOtp({ type: "email" })`, which only
works if the email that arrives contains a **6-digit code**. Supabase ships link-based templates,
so the `{{ .Token }}` placeholder must be added in the dashboard:

1. Supabase dashboard → **Authentication → Emails → Templates**.
2. Enable the **Email OTP** template and make sure **"Email OTP (Token)"** is the template used for
   OTP sign-ins (Authentication → Sign In / Providers → Email → Email OTP).
3. Use this body (the `{{ .Token }}` line is the important part):

   ```html
   <h2>Your Acadivo verification code</h2>
   <p>Hi {{ .Email }}, use this code to finish creating your Acadivo account:</p>
   <p style="font-size:28px;font-weight:700;letter-spacing:6px">{{ .Token }}</p>
   <p>This code expires in 60 minutes. If you did not request it, ignore this email.</p>
   ```

4. Set the redirect allow-list to include `/auth/callback` so the Google flow keeps working.

Without step 3 the user receives a confirmation link instead of a code, and the "Enter the 6-digit
code" screen will never match the message that was sent.

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
