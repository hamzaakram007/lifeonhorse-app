-- Storage buckets and RLS policies for LifeOnHorse media uploads

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('horse-photos', 'horse-photos', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('club-assets', 'club-assets', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('gallery', 'gallery', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Drop existing policies if re-running locally
DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname LIKE 'lifeonhorse_%'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', pol.policyname);
  END LOOP;
END $$;

-- Public read for all LifeOnHorse buckets
CREATE POLICY "lifeonhorse_public_read" ON storage.objects
  FOR SELECT USING (bucket_id IN ('horse-photos', 'club-assets', 'avatars', 'gallery'));

-- Authenticated users upload to their own folder (first path segment = user id)
CREATE POLICY "lifeonhorse_auth_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id IN ('horse-photos', 'club-assets', 'avatars', 'gallery')
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "lifeonhorse_auth_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id IN ('horse-photos', 'club-assets', 'avatars', 'gallery')
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id IN ('horse-photos', 'club-assets', 'avatars', 'gallery')
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "lifeonhorse_auth_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id IN ('horse-photos', 'club-assets', 'avatars', 'gallery')
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
