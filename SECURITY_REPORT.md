# Security Audit — Acadivo (Peercraft)

**Target:** this repository and its Supabase schema (`supabase/migrations/*`), the
Next.js app in `src/`, and the Stripe integration. Deployed app:
`https://assignment-help-tau.vercel.app`.
**Method:** full code + migration review (RLS policies, server actions, API
routes, storage, auth/session), threat-model walkthrough for each audit area,
and static verification (`tsc`, `eslint`). Dynamic cross-tenant testing must run
against a dev/staging Supabase project (script provided) — see *Verification*.
**Date:** 2026-10-10.

## Live database state — read this first

Introspection of the database reachable from `.env.local` (`DIRECT_URL`) shows it
is **not** what the migration folder assumes:

- There is **no `supabase_migrations.schema_migrations` table** — the database was
  not provisioned by the Supabase CLI, so `supabase db push` / `migration list`
  cannot track state (the Remote column is empty for every migration).
- The hardening migration `20260913000005` and everything after it are **not
  applied**: `public.is_admin()` and `guard_order_status_transitions()` do not
  exist; `proposals` still has `helpers_can_update_own_proposals`; `orders` still
  has the original `order_participants_can_update`; `reviews` still has
  `reviews_are_publicly_visible` + `students_can_review_own_orders`; `users`
  still grants `anon`/`authenticated` full table privileges
  (`SELECT/INSERT/UPDATE/DELETE/TRUNCATE/REFERENCES/TRIGGER`).
- `requests` still has the original `students_can_manage_own_requests`
  (which *does* grant SELECT) — so finding **F1 is latent, not currently active**
  on this database.

Consequences:
- **Do not run `supabase db push`** against this database: with no history it
  would try to replay all 29 migrations over an existing schema.
- Applying `20261010000001_business_flow_hardening.sql` **alone** is unsafe: its
  trigger calls `public.is_admin()`, which does not exist here, and would raise
  at runtime on every order status update.
- Confirm whether this database is production, a stale dev copy, or one of
  several; if production, the deployed app is running the pre-harden schema and
  the whole hardening migration series still needs to be deployed in order.

The code changes in this audit are backward-compatible with the pre-harden
schema and were pushed, but the database fixes are **pending deployment**.

## Summary

The codebase is already unusually well hardened: `20260913000005_harden_rls_and_security.sql`
introduced column-level grants, role-escalation fixes, frozen financial columns,
DB length checks, per-table insert rate limits, private storage buckets, and an
admin helper policy. The Stripe flow uses signature verification, a server-side
price authority, and an idempotency index.

This pass found and fixed a small number of **real, high-impact gaps** — most
notably a missing student `SELECT` policy that (once the harden migration is
applied) locks students out of their own requests, a price-tampering window on
accepted proposals, and app code still handing out now-dead public storage URLs.
It also documents the residual items that need a dashboard/config decision.

| # | Severity | Finding | Status |
|---|----------|---------|--------|
| F1 | **Critical** | No `SELECT` policy for students on `requests` → students cannot read their own requests (breaks dashboard, chat, threads) | **Fixed** (migration) |
| F2 | **High** | Helper could edit (reprice) an **accepted** proposal before payment; checkout charges `proposal.price` | **Fixed** (migration + checkout cross-check) |
| F3 | **High** | Storage buckets are private but the app still used public URLs → attachments/deliveries 403 (and the intended private-read policies can't be exercised) | **Fixed** (signed-URL path) |
| F4 | **Medium** | Order status machine enforced only in the UI — participants could force any status (e.g. complete an unpaid order, rewind a paid order) | **Fixed** (DB trigger) |
| F5 | **Medium** | Reviews allowed on unpaid/undelivered orders (and self-orders) → rating/reputation fraud | **Fixed** (migration) |
| F6 | **Medium** | A student could reassign their request's `helper_id` to any user (incl. another student / themselves), then act as the "helper" | **Fixed** (migration) |
| F7 | **Medium** | No edge rate limiting on checkout/auth; `rate_limit_ok` granted to `anon` but never used | **Mitigated / open** |
| F8 | **Medium** | File uploads validate declared MIME only, not content (magic bytes) | **Open (low residual)** |
| F9 | **Medium** | Email verification not enforced at the data layer | **Open (dashboard + policy)** |
| F10 | **Low** | `checkout.session.completed` handled without checking `payment_status`/`mode` | **Fixed** (webhook) |
| F11 | **Low** | `pc-auth-at` 24h-timebox cookie is JS-writable → trivially bypassable | **Open (by design)** |
| F12 | **Low** | `call_logs` insert/update policy lets a participant fabricate/alter records | **Open** |
| F13 | **Low** | Voice-call realtime uses a fixed broadcast channel, unauthenticated beyond login | **Open** |
| F14 | **Low** | `next/image` `remotePatterns` use wildcards (`**.googleusercontent.com`, `**.ggpht.com`) | **Open** |
| F15 | **Low** | No `Content-Security-Policy`; admin audit log covers only some actions | **Partially fixed** |

---

## Detailed findings

### F1 — Students lost read access to their own requests · **Critical** · Fixed
**Where:** `supabase/migrations/20260913000005_harden_rls_and_security.sql:146`
dropped `students_can_manage_own_requests` (a `FOR ALL` policy) and replaced it
with insert/update/delete policies — **but no `SELECT` policy for students**.
The only remaining readers were `helpers_can_view_assigned_requests`
(`20260913000005:172`) and `requests_select_admin` (`:178`).

**Impact:** once the harden migration is applied, `select` on `requests` returns
nothing for a student. Their dashboard, request detail, request-thread messages
and threads break. Because policy sub-queries (`involved_parties_can_view_proposals`,
`request_participants_can_view_messages`) also read `requests`, the fallout is
broad.
**Fix:** `supabase/migrations/20261010000001_business_flow_hardening.sql` adds
`students_can_view_own_requests` (`FOR SELECT USING auth.uid() = student_id`).
This finding also implies the harden migration may be partially applied in
production — verify with `supabase migration list`.

### F2 — Accepted proposals were mutable (price tampering) · **High** · Fixed
**Where:** `20260910000004_enable_rls.sql:62` `helpers_can_update_own_proposals`
has no `WITH CHECK`, so a helper could UPDATE **any** column of **any** of their
proposals, including an already-accepted one. `orders` freezes its own copied
price (`20260913000005:218`) but `src/app/api/checkout/route.ts` charges
`proposal.price`. A helper could raise the price between acceptance and payment.

**Fix (DB):** replaced with `helpers_can_update_own_pending_proposals`
(`status = 'pending'` on both `USING` and `WITH CHECK`) — accepted/declined
proposals become immutable for the helper. The admin policy is unchanged.
**Fix (app):** `checkout/route.ts` now refuses the session with `409` if
`proposal.price`/`currency` differ from the accepted `order.price`/`currency`.

### F3 — Private buckets but public URLs in the app · **High** · Fixed
**Where:** harden migration sets `storage.buckets.public = false`
(`20260913000005:331`) and adds participant-scoped read policies, but
`src/lib/requests.ts:129`, `src/lib/request-chat.ts:39` and
`src/lib/order-files.ts:21` still stored `getPublicUrl(...)` results and the UI
rendered them as `<a href>`. With a private bucket those URLs 403. Additionally
the storage read policies compare `name = any(r.file_urls)` / `= m.attachment_url`
(`:363`, `:368`, `:372`) against stored **full URLs**, which can never match the
object `name` (a bare path).

**Impact:** all request attachments, chat attachments and deliverables are
inaccessible; the private-read policies cannot function; any pre-hardening public
object URLs that leaked remain valid until the bucket is private.
**Fix:**
- New `src/lib/signed-files.ts` (`pathFromStoredUrl`, `sanitizeObjectPath`,
  `pathVariants`, `fileNameFromStoredUrl`) normalizes bare paths **and** legacy
  public URLs.
- New **participant-checked** endpoint `src/app/api/files/url/route.ts` signs a
  private object for 15 min only after verifying the caller is the uploader, a
  request participant, or an order participant.
- New `src/components/ui/secure-file-link.tsx` fetches the signed URL lazily on
  click; wired into `chat-panel.tsx`, `request-workspace.tsx`, `order-workspace.tsx`.
- Admin pages sign server-side via `src/lib/signed-files.server.ts`.
- Uploads now store **bare object paths** (`requests.ts`, `request-chat.ts`,
  `order-files.ts`), matching the storage policies and the signing endpoint.

### F4 — Order status machine not enforced in the DB · **Medium** · Fixed
**Where:** `20260913000005:213` `order_participants_can_update` freezes
`price/currency/helper_id/student_id/proposal_id` but not `status`. Any
participant could set any status with a direct client call
(`src/components/orders/order-workspace.tsx:388` exposes a generic
`setOrderStatus`).
**Impact:** mark an unpaid order `in_progress`/`delivered`/`completed`, or rewind
a paid order to `payment_pending` (bypassing/duplicating checkout), corrupting
guarantee/refund semantics.
**Fix:** trigger `guard_order_status_transitions` (BEFORE UPDATE OF status):
cannot return to `payment_pending`; leaving `payment_pending` must go to
`in_progress` **and** requires a `paid` payment row; `completed` is terminal.
Admins are exempt via `is_admin()` for dispute/refund flows. The Stripe webhook
now writes the payment row **before** flipping the order (the trigger would
otherwise block it).

### F5 — Reviews allowed on unpaid/undelivered orders · **Medium** · Fixed
**Where:** `20260910000004:123` `students_can_review_own_orders` only required
that an order exists with `student_id = auth.uid()`.
**Impact:** a student could review an order before paying (or combined with F6,
self-review to inflate a helper's rating; `recalculate_helper_rating` then
persists it).
**Fix:** replaced with `students_can_review_paid_delivered_orders`
(`status IN ('delivered','completed','disputed')` + a `paid` payment +
`helper_id <> auth.uid()`).

### F6 — Student could set `helper_id` to an arbitrary user · **Medium** · Fixed
**Where:** `20260913000005:161` `students_can_update_own_requests` `WITH CHECK`
only re-asserts `student_id`.
**Impact:** a student could point their request's `helper_id` at themselves or
another student and then insert a proposal (insert policy at `:191` only checks
`r.helper_id = auth.uid()`), creating an order/feedback loop without a real helper.
**Fix:** `WITH CHECK` now also requires `helper_id` to resolve to a
`role = 'helper'` user.

### F7 — Rate limiting at the edge · **Medium** · Mitigated / open
DB insert policies already cap requests (10/min), proposals (20/min) and messages
(60/min). There is no edge/route limit on `POST /api/checkout` or the auth pages.
`public.rate_limit_ok` exists (`20260913000005:104`) and is granted to
`anon, authenticated` (`:135`) but is **never called**, and its backing table
`request_rate_limits` has no TTL cleanup (anonymous calls can grow it).
**Recommendation:** call `rate_limit_ok` from `checkout/route.ts` (keyed on
`user.id`) and from a `src/proxy.ts` rule for auth routes; add a cleanup job; and
revoke `EXECUTE` from `anon` if unused by anon flows.

### F8 — Upload content validation · **Medium** · Open (low residual)
Buckets restrict MIME via `allowed_mime_types` (`20260913000005:334`), enforced
by Supabase Storage against the client-declared type, not magic bytes. A PDF/zip
polyglot is possible. With `X-Content-Type-Options: nosniff` (added) and
private+participant-only delivery, residual risk is low.
**Recommendation:** sniff file signatures in a server upload action for
high-risk types, or accept the residual given the controls above.

### F9 — Email verification not enforced · **Medium** · Open
Sign-up uses Supabase `signUp` (`src/app/(auth)/sign-up/page.tsx:65`) and the DB
policies do not require `auth.users.email_confirmed_at`. Whether email
confirmation is required is a Supabase Auth dashboard setting.
**Recommendation:** confirm "Confirm email" is enabled; optionally add
`email_confirmed_at IS NOT NULL` to the request/order/proposal insert policies.

### F10 — Webhook session checks · **Low** · Fixed
`checkout.session.completed` previously transitioned the order without checking
`session.payment_status` or `session.mode`. Added an early
`mode === "payment" && payment_status === "paid"` guard, on top of the existing
signature verification, `client_reference_id` cross-check, status filter and
unique intent index.

### F11 — Timebox cookie is client-writable · **Low** · Open (by design)
`src/lib/session-timebox.ts:18` sets `pc-auth-at` with `httpOnly: false`, and
`stampAuthAtCookie()` writes it from JS. The 24h re-login "timebox"
(`src/proxy.ts:61`) is therefore advisory — a user can reset it. Not a
confidentiality boundary; documented so it isn't relied on for protection.
**Recommendation:** if a hard 24h cap is required, set the cookie server-side with
`httpOnly: true` and remove the client stamping.

### F12 — `call_logs` can be fabricated/edited · **Low** · Open
`20260913000002:29` allows insert when `auth.uid()` is **either** caller or
callee, and update by either participant, so a user can create or alter records
naming another user. Low impact (audit/informational).
**Recommendation:** require `auth.uid() = caller_id` for inserts and restrict
status/duration edits to the caller.

### F13 — Shared realtime call channel · **Low** · Open
`src/components/call/voice-call.tsx:84` uses a fixed broadcast channel
(`admin-support-call`); any signed-in user can subscribe/broadcast call-signal
payloads. Media is still protected by WebRTC, so impact is call nuisance/spoofing.
**Recommendation:** gate signalling through a table with RLS, or derive the
channel from a per-conversation secret.

### F14 — Image optimizer host wildcards · **Low** · Open
`next.config.ts` allows `**.googleusercontent.com` and `**.ggpht.com`. The
optimizer fetches these server-side (SSRF surface limited to Google-owned hosts);
`isSafeRemoteUrl` already restricts avatar sources.
**Recommendation:** pin to the exact hosts actually used (`lh3.googleusercontent.com`, etc.).

### F15 — CSP & audit-log coverage · **Low** · Partial
Added `Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options`,
`Referrer-Policy`, `Cross-Origin-Opener-Policy`, `Permissions-Policy` and
`poweredByHeader:false` in `next.config.ts`. A strict `Content-Security-Policy`
is intentionally **not** set (Next inline bootstrap scripts + Supabase WebSocket +
Stripe + Google OAuth need a tested allow-list) — add one with a report-only
rollout. Admin audit logging (`src/lib/audit.ts`) covers user status/role edits,
refunds, message flags/warnings, but not every admin view/action.

---

## Verified as strong (no action)

- **No secrets in git:** no tracked `.env*`; `.gitignore` covers env files; history scan clean.
- **Service-role isolation:** `src/lib/supabase/admin.ts` imports `server-only`;
  all `adminClient` use is in server actions/pages/API routes.
- **Role escalation:** `handle_new_user` ignores client role (`20260913000005:72`);
  `users` column grants + `WITH CHECK` freeze `role`/`status`/`email` (`:39`, `:60`).
- **Stripe:** raw-body signature verification (`webhook/route.ts:17`),
  `client_reference_id`↔order cross-check, `payment_pending`→`in_progress` only,
  partial unique index on `stripe_payment_intent_id` (`:286`), amount computed
  server-side from the accepted proposal (`checkout/route.ts`).
- **XSS:** no `dangerouslySetInnerHTML` on user data (only static JSON-LD);
  React escaping throughout; no `eval`/`innerHTML`.
- **Open redirect:** `next` guards require `/` and reject `//` (sign-in page and
  `auth/callback`).
- **Admin authz:** route guard in `src/proxy.ts:101`, `requireAdmin()` in every
  admin server action (`admin/actions.ts`, `admin/chat-monitor/actions.ts`).
- **DB validation:** length CHECKs and per-table insert rate windows on
  requests/proposals/messages/reviews/deliveries/notifications/helper_profiles.

---

## Verification

- `npx tsc --noEmit` — clean.
- `npx eslint` — clean for every changed file. (Two pre-existing
  `no-explicit-any` errors remain in `src/app/auth/callback/route.ts`; four unused
  warnings in `src/app/(auth)/sign-up/page.tsx`. Neither file was touched here.)
- **Dynamic RLS tests were not executed in this environment** (no dev/staging
  Supabase credentials; running against production is out of scope). Added
  `scripts/test-security-audit.mjs` — run against a **dev** project after
  `supabase db push`:
  - student can read own request; another student cannot;
  - helper cannot reprice an accepted proposal;
  - cannot complete an unpaid order;
  - cannot review an unpaid order;
  - `/api/files/url` rejects anonymous/non-participant requests.
- No production data, real users, or live Stripe were touched.

## Not verifiable from the repository (confirm in dashboards)

- Supabase Auth: email confirmation, allowed redirect URLs, auth rate limits, MFA.
- Stripe: webhook endpoint + `STRIPE_WEBHOOK_SECRET` configured; only events needed;
  live-mode keys not committed.
- Vercel: production env vars set (no `NEXT_PUBLIC_*` secret leakage); preview deploys restricted.
- Dependency CVEs: run `npm audit` and review the lockfile in CI.

## Go-live checklist

> The database is **not CLI-managed** and is pre-harden (see top section). Resolve
> the schema baseline before any push; the steps below assume that is done.

1. Decide the schema baseline: either (a) `supabase link` + repair history, or
   (b) apply the missing migrations in order directly against the database.
2. Apply `20260913000005_harden_rls_and_security.sql` and everything after it
   **in order**, then `20261010000001_business_flow_hardening.sql` (F1–F6).
3. Confirm `public.is_admin()` and `guard_order_status_transitions` exist, and
   that `storage.buckets` for `request-files`/`order-files` have `public = false`.
4. Run `node scripts/test-security-audit.mjs` against staging; fix any FAIL.
5. Optional backfill: convert legacy stored full URLs to bare paths in
   `requests.file_urls`, `messages.attachment_url`, `deliveries.file_urls`
   (the UI already tolerates both, but bare paths are canonical).
6. Confirm "Confirm email" and allowed redirect URLs in Supabase Auth.
7. Add `rate_limit_ok` calls to `/api/checkout` and auth routes (F7).
8. Add a report-only CSP, then enforce (F15).
9. Confirm Stripe webhook secret and endpoint in the dashboard.

## Changes in this audit

- `supabase/migrations/20261010000001_business_flow_hardening.sql` (new): F1, F2, F4, F5, F6.
- `src/app/api/checkout/route.ts`: proposal/order price+currency cross-check (F2).
- `src/app/api/stripe/webhook/route.ts`: `payment_status`/`mode` guard, payment-before-status (F4, F10).
- `src/lib/signed-files.ts`, `src/lib/signed-files.server.ts`,
  `src/app/api/files/url/route.ts`, `src/components/ui/secure-file-link.tsx` (new): F3.
- `src/lib/requests.ts`, `src/lib/request-chat.ts`, `src/lib/order-files.ts`: store bare object paths (F3).
- `src/components/chat/chat-panel.tsx`, `src/components/requests/request-workspace.tsx`,
  `src/components/orders/order-workspace.tsx`, `src/app/admin/requests/[id]/page.tsx`,
  `src/app/admin/orders/[id]/page.tsx`: signed file links (F3).
- `next.config.ts`: security headers, `poweredByHeader:false` (F15).
- `scripts/test-security-audit.mjs` (new): regression checks.
