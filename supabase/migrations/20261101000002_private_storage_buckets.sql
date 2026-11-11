-- Make file buckets private. Downloads must go through /api/files/url, which
-- verifies the caller is a participant before issuing a short-lived signed URL.
update storage.buckets
set public = false,
    file_size_limit = 26214400, -- 25 MB
    allowed_mime_types = array[
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'text/csv',
      'application/rtf',
      'application/vnd.oasis.opendocument.text',
      'application/zip',
      'image/png',
      'image/jpeg',
      'image/gif',
      'image/webp',
      'image/heic'
    ]
where id in ('request-files', 'order-files');

-- Remove anonymous/public read access. Signed URLs are minted server-side with
-- the service role, so no direct SELECT policy is needed for downloads.
drop policy if exists "request_files_public_read" on storage.objects;
drop policy if exists "order_files_public_read" on storage.objects;

-- Participants may still read their own objects directly (belt and suspenders):
-- request-files/reports are owned by the first path segment (uid), order-files
-- by the order's student/helper.
drop policy if exists "request_files_participant_read" on storage.objects;
create policy "request_files_participant_read"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'request-files'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "order_files_participant_read" on storage.objects;
create policy "order_files_participant_read"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'order-files'
    and exists (
      select 1 from public.orders o
      where o.id::text = (storage.foldername(name))[1]
        and (o.student_id = auth.uid() or o.helper_id = auth.uid())
    )
  );