-- Storage for request attachments
-- A public bucket so uploaded files are reachable via public URLs; uploads are
-- scoped to the signed-in user's own folder via RLS on storage.objects.

insert into storage.buckets (id, name, public)
values ('request-files', 'request-files', true)
on conflict (id) do nothing;

-- Anyone can read objects in the bucket (public bucket).
create policy "request_files_public_read"
  on storage.objects for select
  using (bucket_id = 'request-files');

-- Authenticated users can only upload into a folder named after their own uid.
create policy "request_files_authenticated_insert"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'request-files'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Owners can delete their own uploads.
create policy "request_files_owner_delete"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'request-files'
    and (storage.foldername(name))[1] = auth.uid()::text
  );