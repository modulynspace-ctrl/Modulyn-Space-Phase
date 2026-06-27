-- ============================================================
-- Modulyn Space — Migration 003: Storage Buckets
-- Run AFTER 002_rls_policies.sql
-- ============================================================

-- Create storage buckets
-- public = true means files are publicly accessible via URL (no signed URLs needed)

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('projects', 'projects', TRUE,  10485760, ARRAY['image/jpeg','image/png','image/webp','image/avif']),
  ('products',  'products', TRUE,  10485760, ARRAY['image/jpeg','image/png','image/webp','image/avif']),
  ('team',      'team',     TRUE,  5242880,  ARRAY['image/jpeg','image/png','image/webp']),
  ('media',     'media',    TRUE,  52428800, ARRAY['image/jpeg','image/png','image/webp','image/avif','image/gif','video/mp4']),
  ('brands',    'brands',   TRUE,  5242880,  ARRAY['image/jpeg','image/png','image/webp','image/svg+xml'])
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- STORAGE RLS POLICIES
-- ============================================================

-- PROJECTS bucket
CREATE POLICY "Public can read project images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'projects');

CREATE POLICY "Admin can upload project images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'projects' AND public.is_admin_or_editor());

CREATE POLICY "Admin can update project images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'projects' AND public.is_admin_or_editor());

CREATE POLICY "Admin can delete project images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'projects' AND public.is_admin_or_editor());

-- PRODUCTS bucket
CREATE POLICY "Public can read product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'products');

CREATE POLICY "Admin can upload product images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'products' AND public.is_admin_or_editor());

CREATE POLICY "Admin can update product images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'products' AND public.is_admin_or_editor());

CREATE POLICY "Admin can delete product images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'products' AND public.is_admin_or_editor());

-- TEAM bucket
CREATE POLICY "Public can read team images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'team');

CREATE POLICY "Admin can upload team images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'team' AND public.is_admin_or_editor());

CREATE POLICY "Admin can update team images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'team' AND public.is_admin_or_editor());

CREATE POLICY "Admin can delete team images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'team' AND public.is_admin_or_editor());

-- MEDIA bucket
CREATE POLICY "Public can read media files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'media');

CREATE POLICY "Admin can upload media files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'media' AND public.is_admin_or_editor());

CREATE POLICY "Admin can update media files"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'media' AND public.is_admin_or_editor());

CREATE POLICY "Admin can delete media files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'media' AND public.is_admin_or_editor());

-- BRANDS bucket
CREATE POLICY "Public can read brand logos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'brands');

CREATE POLICY "Admin can upload brand logos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'brands' AND public.is_admin_or_editor());

CREATE POLICY "Admin can update brand logos"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'brands' AND public.is_admin_or_editor());

CREATE POLICY "Admin can delete brand logos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'brands' AND public.is_admin_or_editor());
