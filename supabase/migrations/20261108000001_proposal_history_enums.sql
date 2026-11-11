-- Proposal lifecycle now keeps a history instead of deleting/reusing a single row.
-- "revision_requested" is the active quote after the student asks for a new price.
-- "replaced" marks an older quote that a helper has since superseded.
--
-- This file is intentionally separate from the migration that uses the new
-- values: PostgreSQL cannot reference a freshly added enum value in the same
-- transaction that added it.
alter type public.proposal_status add value if not exists 'revision_requested';
alter type public.proposal_status add value if not exists 'replaced';
