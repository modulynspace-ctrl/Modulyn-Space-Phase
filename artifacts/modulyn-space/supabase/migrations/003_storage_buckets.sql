-- ============================================================
-- Modulyn Space — Migration 003: Storage Buckets & Policies
-- Run AFTER 002_rls_policies.sql
-- ============================================================

-- ============================================================
-- CREATE BUCKETS
-- public = TRUE → objects accessible via public URL (no signed URLs)
-- file_size_limit is in bytes
-- ============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('projects', 'projects', TRUE, 10485760,  -- 10 MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif']),
  ('products',  'products', TRUE, 10485760,  -- 10 MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif']),
  ('team',      'team',     TRUE,  5242880,  -- 5 MB
    ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('media',     'media',    TRUE, 52428800,  -- 50 MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif', 'video/mp4']),
  ('brands',    'brands',   TRUE,  5242880,  -- 5 MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'])
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- STORAGE OBJECT POLICIES
-- Consolidated to one policy per operation across all buckets —
-- cleaner than 20 individual bucket policies.
-- ============================================================

-- All five buckets are publicly readable (no auth required)
CREATE POLICY "storage_public_read"
  ON storage.objects
  FOR SELECT
  USING (bucket_id IN ('projects', 'products', 'team', 'media', 'brands'));

-- Only admin/editor users can upload new files
CREATE POLICY "storage_admin_insert"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id IN ('projects', 'products', 'team', 'media', 'brands')
    AND public.is_admin_or_editor()
  );

-- Only admin/editor users can replace / rename files
-- WITH CHECK ensures objects cannot be moved to a different bucket
CREATE POLICY "storage_admin_update"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id IN ('projects', 'products', 'team', 'media', 'brands')
    AND public.is_admin_or_editor()
  )
  WITH CHECK (
    bucket_id IN ('projects', 'products', 'team', 'media', 'brands')
    AND public.is_admin_or_editor()
  );

-- Only admin/editor users can delete files
CREATE POLICY "storage_admin_delete"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id IN ('projects', 'products', 'team', 'media', 'brands')
    AND public.is_admin_or_editor()
  );
