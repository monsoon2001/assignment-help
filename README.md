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

## Status-change email notifications

Major activities email the student, the helper and every admin so nobody has to keep the portal open:
new request, new proposal, proposal accepted/declined, payment confirmed, delivery submitted,
revision requested, order completed, refund and payment dispute.

Setup (optional — without a key the app still runs and just logs that email was skipped):

```bash
RESEND_API_KEY=re_xxx
EMAIL_FROM="Acadivo <notifications@your-verified-domain.com>"
```

- Sender lives in `src/lib/email.server.ts` (Resend HTTP API, no extra dependency).
- Fan-out lives in `src/lib/notify.server.ts`; browser-originated events call `POST /api/notify`
  via `src/lib/notify-client.ts`, server paths (order accept, Stripe webhook) call it directly.
- Emails are dispatched with Next's `after()` so they never add latency to the user's response.
- In-app bell rows are still created by the existing Postgres triggers; email is additional.

## Security notes

- Orders are inserted only by `POST /api/orders/accept` using the service role; the client-facing
  orders INSERT policy was dropped (`20261016000001_harden_order_insert.sql`) so the charge amount
  can never be forged from the browser. **Apply this migration.**
- A Content-Security-Policy is set in `next.config.ts`.
- Redirect targets are sanitised with `safeNextPath()` (`src/lib/auth.ts`).

## Payments (multi-currency local charge, platform-collected)

All charges are collected by Acadivo's **own Stripe account**. There is **no Stripe Connect**, no
connected accounts, destination charges, application fees, transfers or Stripe payouts. Helpers are
paid manually by the team (Wise / bank transfer) outside the app.

**How a quote becomes a charge.** A helper quotes in **any supported currency**. When the student
accepts the proposal, the server (`POST /api/orders/accept`) locks the charge in the **student's
local currency**, derived from their saved sign-up location (`users.country`):

- The **base** amount/currency (what the helper quoted) is stored on the order as
  `base_amount` / `base_currency`, alongside `charge_amount` / `charge_currency` / `charge_locked_at`.
- A Canadian student is charged the base amount converted to CAD with **no buffer**. Everyone else is
  charged the local-currency equivalent of the base **plus a hidden FX/processing buffer**
  (`platform_settings.fx_surcharge_percent`, default `3.5%`). The buffer is **never itemized** — the
  student only ever sees a single total.
- Rates come from the Frankfurter API (`base=CAD`), cached 24h server-side. If no rate is available the
  charge **falls back to CAD** so acceptance never fails.
- The rate and amount are **locked at acceptance**; the platform absorbs later drift.

- The amount charged is taken from the **locked charge stored in the database**, never from the client,
  so tampering with the page cannot change the Stripe amount.
- Students see a **single total** — no commission, fee or helper-share is ever shown or returned to a
  student or helper client. Helpers and admins see CAD equivalents and the full breakdown.
- A **private ledger** on `payments` records the charge (`charge_currency`, `charge_amount`,
  `charge_to_cad_rate`), the CAD settlement (`gross_cad`, `stripe_fee_cad`, `net_cad`), the hidden
  buffer (`platform_fee_cad = gross_cad − base CAD value`) and `helper_payout_status`, `disputed`,
  `refunded_amount_cad`. These columns are readable only by admins; student/helper clients are limited
  to non-sensitive columns by column grants.
- **Manual payouts** are recorded on `manual_payouts` / `manual_payout_items` via the
  `record_helper_payout` RPC, with no helper percentage — the admin enters the amount sent. Per-order
  amounts are split proportionally to each order's CAD value (bookkeeping only). An order can never be
  paid out twice (`unique(order_id)`); the helper's Earnings page shows these payout receipts.
- The "This Month" figure on the helper dashboard reads from the `helper_payouts` view.
- The webhook is the **only** writer that flips an order to `in_progress`, verifies the Stripe
  signature on the raw body, and is **idempotent** (`processed_stripe_events`). Refunds convert the
  refunded presentment amount back to CAD via the locked `charge_to_cad_rate`; disputes set the payout
  to `on_hold`.

Apply the multi-currency migration (also drops the old `helper_payments` view / `helper_compensation`
table and creates the `helper_payouts` view):

```bash
psql "$DIRECT_URL" -v ON_ERROR_STOP=1 -f supabase/migrations/20261013000001_multicurrency_local_charge.sql
```

## Verification

```bash
npx tsc --noEmit
npm run lint
npm run build
node scripts/test-proposal-flow.mjs
node scripts/test-order-flow.mjs
node scripts/test-phase7to10.mjs   # notifications + admin panel (Phase 7-10)
node scripts/test-payment-model.mjs  # multi-currency local-charge + manual-payout model
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
4. Configure a Stripe webhook in the Stripe dashboard pointing to `https://<your-domain>/api/stripe/webhook` with the `checkout.session.completed`, `charge.refunded` and `charge.dispute.created` events, and set `STRIPE_WEBHOOK_SECRET` to that endpoint&apos;s signing secret.
5. While in test mode, keep test-mode Stripe keys. To go live, swap all Stripe keys and the webhook secret for live-mode values (settings page / admin panel reference them via env).
6. `vercel --prod` (auth/proxy conventions are already in `src/proxy.ts`; Realtime needs Supabase Realtime enabled — the `admin_messages` publication is added by migration `20260910000009_admin_panel.sql`).
# assignment-help
# assignment-help
