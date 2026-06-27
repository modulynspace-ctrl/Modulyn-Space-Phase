-- ============================================================
-- Modulyn Space — Migration 001: Initial Schema
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================

-- Enable UUID extension (already on by default in Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- USERS
-- Extends Supabase auth.users with profile data
-- ============================================================
CREATE TABLE IF NOT EXISTS public.users (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     TEXT,
  avatar_url    TEXT,
  role          TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'editor', 'viewer')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PROJECTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.projects (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title             TEXT NOT NULL,
  slug              TEXT NOT NULL UNIQUE,
  category          TEXT NOT NULL CHECK (category IN (
                      'home_interior','modular_kitchen','wardrobe',
                      'turnkey','renovation','commercial',
                      'furniture','false_ceiling','electrical','landscape'
                    )),
  description       TEXT,
  short_description TEXT,
  location          TEXT,
  area_sqft         INTEGER,
  duration_months   INTEGER,
  budget_range      TEXT,
  client_name       TEXT,
  status            TEXT NOT NULL DEFAULT 'planning' CHECK (status IN ('planning','in_progress','completed')),
  featured          BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order        INTEGER NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PROJECT IMAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.project_images (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id  UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  url         TEXT NOT NULL,
  alt_text    TEXT,
  is_hero     BOOLEAN NOT NULL DEFAULT FALSE,
  is_before   BOOLEAN NOT NULL DEFAULT FALSE,
  is_after    BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- SERVICES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.services (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title             TEXT NOT NULL,
  slug              TEXT NOT NULL UNIQUE,
  description       TEXT,
  short_description TEXT,
  icon              TEXT,
  sort_order        INTEGER NOT NULL DEFAULT 0,
  active            BOOLEAN NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PRODUCTS (Modulyn Store)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.products (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title           TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  category        TEXT NOT NULL CHECK (category IN ('sofa','dining','wardrobe','bed','accessory','other')),
  description     TEXT,
  material        TEXT,
  price_range_min INTEGER,
  price_range_max INTEGER,
  image_url       TEXT,
  featured        BOOLEAN NOT NULL DEFAULT FALSE,
  active          BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TESTIMONIALS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.testimonials (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_name     TEXT NOT NULL,
  client_location TEXT,
  project_id      UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  rating          INTEGER NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  content         TEXT NOT NULL,
  avatar_url      TEXT,
  featured        BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  active          BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- CONTACT REQUESTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.contact_requests (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         TEXT NOT NULL,
  email        TEXT NOT NULL,
  phone        TEXT,
  project_type TEXT,
  message      TEXT,
  status       TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','replied','closed')),
  notes        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- CONSULTATION BOOKINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.consultation_bookings (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name           TEXT NOT NULL,
  email          TEXT NOT NULL,
  phone          TEXT,
  preferred_date DATE,
  preferred_time TEXT,
  location       TEXT,
  project_type   TEXT,
  message        TEXT,
  status         TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','cancelled','completed')),
  notes          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- FAQ
-- ============================================================
CREATE TABLE IF NOT EXISTS public.faq (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question   TEXT NOT NULL,
  answer     TEXT NOT NULL,
  category   TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TEAM MEMBERS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.team_members (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT NOT NULL,
  role       TEXT NOT NULL,
  bio        TEXT,
  image_url  TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- MATERIAL BRANDS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.material_brands (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  logo_url    TEXT,
  website_url TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- HOMEPAGE SETTINGS (single-row config)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.homepage_settings (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hero_headline        TEXT DEFAULT 'Designing Spaces That Feel Like Home. Crafted To Last.',
  hero_subheading      TEXT,
  hero_image_url       TEXT,
  featured_project_id  UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  stats_projects_count INTEGER DEFAULT 200,
  stats_clients_count  INTEGER DEFAULT 150,
  stats_years          INTEGER DEFAULT 1,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- MEDIA LIBRARY
-- ============================================================
CREATE TABLE IF NOT EXISTS public.media_library (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  filename      TEXT NOT NULL,
  original_name TEXT NOT NULL,
  url           TEXT NOT NULL,
  bucket        TEXT NOT NULL,
  mime_type     TEXT,
  size_bytes    BIGINT,
  alt_text      TEXT,
  tags          TEXT[] DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- WEBSITE SETTINGS (key-value store)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.website_settings (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key         TEXT NOT NULL UNIQUE,
  value       TEXT,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- AUTO-UPDATE updated_at TRIGGER FUNCTION
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'users','projects','services','products','testimonials',
    'contact_requests','consultation_bookings','faq','team_members',
    'material_brands','homepage_settings','media_library','website_settings'
  ] LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS set_updated_at ON public.%I;
       CREATE TRIGGER set_updated_at
       BEFORE UPDATE ON public.%I
       FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();',
      t, t
    );
  END LOOP;
END;
$$;

-- ============================================================
-- SEED: default homepage_settings row
-- ============================================================
INSERT INTO public.homepage_settings (hero_headline, hero_subheading, stats_projects_count, stats_clients_count, stats_years)
VALUES (
  'Designing Spaces That Feel Like Home. Crafted To Last.',
  'Bespoke residential and commercial interiors in Karnataka. We bring transparency, unhurried craftsmanship, and timeless quality to every project.',
  200, 150, 1
)
ON CONFLICT DO NOTHING;

-- ============================================================
-- SEED: default website_settings
-- ============================================================
INSERT INTO public.website_settings (key, value, description) VALUES
  ('site_name',       'Modulyn Space',                          'Public website name'),
  ('site_email',      'hello@modulynspace.com',                 'Primary contact email'),
  ('site_phone',      '+91 98765 43210',                        'Primary contact phone'),
  ('site_address',    '123 Design Avenue, Bengaluru 560001',    'Studio address'),
  ('whatsapp_number', '919876543210',                           'WhatsApp number for CTA links'),
  ('instagram_url',   'https://instagram.com/modulynspace',     'Instagram profile URL'),
  ('facebook_url',    'https://facebook.com/modulynspace',      'Facebook page URL'),
  ('linkedin_url',    'https://linkedin.com/company/modulynspace', 'LinkedIn page URL')
ON CONFLICT (key) DO NOTHING;
-- ============================================================
-- Modulyn Space — Migration 002: Row Level Security Policies
-- Run AFTER 001_initial_schema.sql
-- ============================================================

-- Enable RLS on every table
ALTER TABLE public.users                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_images        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_requests      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultation_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faq                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.material_brands       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_settings     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_library         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_settings      ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- PUBLIC READ POLICIES
-- Visitors can read published/active content only
-- ============================================================

-- Projects: public can read completed/in_progress projects
CREATE POLICY "Public can read projects"
  ON public.projects FOR SELECT
  USING (status IN ('in_progress', 'completed'));

-- Project images: public can read images of readable projects
CREATE POLICY "Public can read project images"
  ON public.project_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_images.project_id
      AND p.status IN ('in_progress', 'completed')
    )
  );

-- Services: public can read active services
CREATE POLICY "Public can read active services"
  ON public.services FOR SELECT
  USING (active = TRUE);

-- Products: public can read active products
CREATE POLICY "Public can read active products"
  ON public.products FOR SELECT
  USING (active = TRUE);

-- Testimonials: public can read active testimonials
CREATE POLICY "Public can read active testimonials"
  ON public.testimonials FOR SELECT
  USING (active = TRUE);

-- FAQ: public can read active FAQs
CREATE POLICY "Public can read active faqs"
  ON public.faq FOR SELECT
  USING (active = TRUE);

-- Team members: public can read active team members
CREATE POLICY "Public can read active team members"
  ON public.team_members FOR SELECT
  USING (active = TRUE);

-- Material brands: public can read active brands
CREATE POLICY "Public can read active brands"
  ON public.material_brands FOR SELECT
  USING (active = TRUE);

-- Homepage settings: public can read
CREATE POLICY "Public can read homepage settings"
  ON public.homepage_settings FOR SELECT
  USING (TRUE);

-- Website settings: public can read
CREATE POLICY "Public can read website settings"
  ON public.website_settings FOR SELECT
  USING (TRUE);

-- ============================================================
-- PUBLIC WRITE POLICIES
-- Visitors can submit contact forms and bookings (anonymous)
-- ============================================================

CREATE POLICY "Anyone can submit contact requests"
  ON public.contact_requests FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Anyone can submit consultation bookings"
  ON public.consultation_bookings FOR INSERT
  WITH CHECK (TRUE);

-- ============================================================
-- ADMIN FULL-ACCESS POLICIES
-- Authenticated admin/editor users can do everything
-- These will be tightened once auth roles are implemented
-- ============================================================

-- Helper: returns true if the current user has admin or editor role
CREATE OR REPLACE FUNCTION public.is_admin_or_editor()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND role IN ('admin', 'editor')
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper: returns true if the current user has admin role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Users: admins can manage all, users can read own profile
CREATE POLICY "Admins can manage users"
  ON public.users FOR ALL
  USING (public.is_admin());

CREATE POLICY "Users can read own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- Projects: admin/editors can manage
CREATE POLICY "Admins can manage projects"
  ON public.projects FOR ALL
  USING (public.is_admin_or_editor());

-- Project images: admin/editors can manage
CREATE POLICY "Admins can manage project images"
  ON public.project_images FOR ALL
  USING (public.is_admin_or_editor());

-- Services: admin/editors can manage
CREATE POLICY "Admins can manage services"
  ON public.services FOR ALL
  USING (public.is_admin_or_editor());

-- Products: admin/editors can manage
CREATE POLICY "Admins can manage products"
  ON public.products FOR ALL
  USING (public.is_admin_or_editor());

-- Testimonials: admin/editors can manage
CREATE POLICY "Admins can manage testimonials"
  ON public.testimonials FOR ALL
  USING (public.is_admin_or_editor());

-- Contact requests: admin/editors can read and update (reply)
CREATE POLICY "Admins can manage contact requests"
  ON public.contact_requests FOR ALL
  USING (public.is_admin_or_editor());

-- Consultation bookings: admin/editors can manage
CREATE POLICY "Admins can manage bookings"
  ON public.consultation_bookings FOR ALL
  USING (public.is_admin_or_editor());

-- FAQ: admin/editors can manage
CREATE POLICY "Admins can manage faqs"
  ON public.faq FOR ALL
  USING (public.is_admin_or_editor());

-- Team members: admin/editors can manage
CREATE POLICY "Admins can manage team members"
  ON public.team_members FOR ALL
  USING (public.is_admin_or_editor());

-- Material brands: admin/editors can manage
CREATE POLICY "Admins can manage material brands"
  ON public.material_brands FOR ALL
  USING (public.is_admin_or_editor());

-- Homepage settings: admins only
CREATE POLICY "Admins can manage homepage settings"
  ON public.homepage_settings FOR ALL
  USING (public.is_admin());

-- Media library: admin/editors can manage
CREATE POLICY "Admins can manage media library"
  ON public.media_library FOR ALL
  USING (public.is_admin_or_editor());

-- Website settings: admins only
CREATE POLICY "Admins can manage website settings"
  ON public.website_settings FOR ALL
  USING (public.is_admin());
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
