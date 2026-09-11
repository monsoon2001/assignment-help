-- Enums
-- Roles for the three areas of the app.
create type public.user_role as enum ('student', 'helper', 'admin');

-- Request lifecycle: requested -> proposal_sent -> accepted | declined
create type public.request_status as enum (
  'requested',
  'proposal_sent',
  'accepted',
  'declined',
  'cancelled'
);

-- Proposal lifecycle, consistent with the request statuses above.
create type public.proposal_status as enum (
  'pending',
  'accepted',
  'declined',
  'withdrawn'
);

-- Order lifecycle.
create type public.order_status as enum (
  'payment_pending',
  'in_progress',
  'delivered',
  'revision_requested',
  'completed',
  'disputed'
);

-- Payment lifecycle.
create type public.payment_status as enum (
  'pending',
  'paid',
  'refunded'
);