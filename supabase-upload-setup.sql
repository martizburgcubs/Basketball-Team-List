-- OPTIONAL SIGNED TEAM LIST UPLOAD
-- Run this in the EXISTING Supabase project only if you want the website's
-- 'Upload Signed Team List' feature.
-- No admin portal and no team submission tables are required.

insert into storage.buckets (id,name,public)
values ('joi-signed-team-lists','joi-signed-team-lists',false)
on conflict (id) do nothing;

drop policy if exists "coaches can upload signed joi team lists" on storage.objects;

create policy "coaches can upload signed joi team lists"
on storage.objects
for insert
to anon
with check (bucket_id='joi-signed-team-lists');

-- There is intentionally NO public read policy.
-- Uploaded signed rosters can be viewed/downloaded by you inside Supabase Storage.
