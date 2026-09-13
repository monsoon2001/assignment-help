-- Publish workstream tables so request/order status changes arrive in realtime.
-- The client workspaces already subscribe to these tables; without membership the
-- subscriptions are dead and the UIs fall back to polling.
alter publication supabase_realtime add table public.requests;
alter publication supabase_realtime add table public.orders;
alter publication supabase_realtime add table public.proposals;