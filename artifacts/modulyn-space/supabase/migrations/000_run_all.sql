-- ============================================================
-- Modulyn Space — Migration 001: Initial Schema
-- Run in: Supabase Dashboard → SQL Editor
-- ============================================================

-- ============================================================
-- USERS
-- Extends Supabase auth.users with profile data
-- ============================================================
CREATE TABLE IF NOT EXISTS public.users (
  id         UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name  TEXT,
  avatar_url TEXT,
  role       TEXT        NOT NULL DEFAULT 'viewer'
                         CHECK (role IN ('admin', 'editor', 'viewer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PROJECTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.projects (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title             TEXT        NOT NULL,
  slug              TEXT        NOT NULL UNIQUE,
  category          TEXT        NOT NULL
                               CHECK (category IN (
                                 'home_interior', 'modular_kitchen', 'wardrobe',
                                 'turnkey', 'renovation', 'commercial',
                                 'furniture', 'false_ceiling', 'electrical', 'landscape'
                               )),
  description       TEXT,
  short_description TEXT,
  location          TEXT,
  area_sqft         INTEGER,
  duration_months   INTEGER,
  budget_range      TEXT,
  client_name       TEXT,
  status            TEXT        NOT NULL DEFAULT 'draft'
                               CHECK (status IN ('draft', 'planning', 'in_progress', 'completed', 'archived')),
  featured          BOOLEAN     NOT NULL DEFAULT FALSE,
  sort_order        INTEGER     NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PROJECT IMAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.project_images (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID        NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  url        TEXT        NOT NULL,
  alt_text   TEXT,
  is_hero    BOOLEAN     NOT NULL DEFAULT FALSE,
  is_before  BOOLEAN     NOT NULL DEFAULT FALSE,
  is_after   BOOLEAN     NOT NULL DEFAULT FALSE,
  sort_order INTEGER     NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- SERVICES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.services (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title             TEXT        NOT NULL,
  slug              TEXT        NOT NULL UNIQUE,
  description       TEXT,
  short_description TEXT,
  icon              TEXT,
  sort_order        INTEGER     NOT NULL DEFAULT 0,
  active            BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PRODUCTS (Modulyn Store)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.products (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT        NOT NULL,
  slug            TEXT        NOT NULL UNIQUE,
  category        TEXT        NOT NULL
                             CHECK (category IN ('sofa', 'dining', 'wardrobe', 'bed', 'accessory', 'other')),
  description     TEXT,
  material        TEXT,
  price_range_min INTEGER,
  price_range_max INTEGER,
  image_url       TEXT,
  featured        BOOLEAN     NOT NULL DEFAULT FALSE,
  active          BOOLEAN     NOT NULL DEFAULT TRUE,
  sort_order      INTEGER     NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TESTIMONIALS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.testimonials (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name     TEXT        NOT NULL,
  client_location TEXT,
  project_id      UUID        REFERENCES public.projects(id) ON DELETE SET NULL,
  rating          INTEGER     NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  content         TEXT        NOT NULL,
  avatar_url      TEXT,
  featured        BOOLEAN     NOT NULL DEFAULT FALSE,
  sort_order      INTEGER     NOT NULL DEFAULT 0,
  active          BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- CONTACT REQUESTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.contact_requests (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT        NOT NULL,
  email        TEXT        NOT NULL CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone        TEXT,
  project_type TEXT,
  message      TEXT,
  status       TEXT        NOT NULL DEFAULT 'new'
                           CHECK (status IN (
                             'new', 'contacted', 'site_visit_scheduled',
                             'proposal_sent', 'work_started', 'completed', 'closed'
                           )),
  notes        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- CONSULTATION BOOKINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.consultation_bookings (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT        NOT NULL,
  email          TEXT        NOT NULL CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone          TEXT,
  preferred_date DATE,
  preferred_time TEXT,
  location       TEXT,
  project_type   TEXT,
  message        TEXT,
  status         TEXT        NOT NULL DEFAULT 'pending'
                             CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  notes          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- FAQS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.faqs (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  question   TEXT        NOT NULL,
  answer     TEXT        NOT NULL,
  category   TEXT,
  sort_order INTEGER     NOT NULL DEFAULT 0,
  active     BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TEAM MEMBERS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.team_members (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT        NOT NULL,
  role       TEXT        NOT NULL,
  bio        TEXT,
  image_url  TEXT,
  sort_order INTEGER     NOT NULL DEFAULT 0,
  active     BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- MATERIAL BRANDS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.material_brands (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        NOT NULL,
  logo_url    TEXT,
  website_url TEXT,
  sort_order  INTEGER     NOT NULL DEFAULT 0,
  active      BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- HOMEPAGE SETTINGS (enforced single-row via singleton column)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.homepage_settings (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  -- singleton enforces exactly one row in this table
  singleton            BOOLEAN     NOT NULL DEFAULT TRUE UNIQUE CHECK (singleton = TRUE),
  hero_headline        TEXT        DEFAULT 'Designing Spaces That Feel Like Home. Crafted To Last.',
  hero_subheading      TEXT,
  hero_image_url       TEXT,
  featured_project_id  UUID        REFERENCES public.projects(id) ON DELETE SET NULL,
  stats_projects_count INTEGER     DEFAULT 200,
  stats_clients_count  INTEGER     DEFAULT 150,
  stats_years          INTEGER     DEFAULT 1,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- MEDIA LIBRARY
-- ============================================================
CREATE TABLE IF NOT EXISTS public.media_library (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  filename      TEXT        NOT NULL,
  original_name TEXT        NOT NULL,
  url           TEXT        NOT NULL,
  bucket        TEXT        NOT NULL,
  mime_type     TEXT,
  size_bytes    BIGINT,
  alt_text      TEXT,
  tags          TEXT[]      NOT NULL DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- WEBSITE SETTINGS (key-value store)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.website_settings (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  key         TEXT        NOT NULL UNIQUE,
  value       TEXT,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- PostgreSQL does not auto-create indexes on FK columns
-- ============================================================

-- Foreign keys
CREATE INDEX IF NOT EXISTS idx_project_images_project_id  ON public.project_images (project_id);
CREATE INDEX IF NOT EXISTS idx_testimonials_project_id    ON public.testimonials    (project_id);

-- Common filter / sort columns
CREATE INDEX IF NOT EXISTS idx_projects_status            ON public.projects         (status);
CREATE INDEX IF NOT EXISTS idx_projects_featured          ON public.projects         (featured);
CREATE INDEX IF NOT EXISTS idx_projects_category          ON public.projects         (category);
CREATE INDEX IF NOT EXISTS idx_projects_sort_order        ON public.projects         (sort_order);

CREATE INDEX IF NOT EXISTS idx_products_category          ON public.products         (category);
CREATE INDEX IF NOT EXISTS idx_products_active            ON public.products         (active);
CREATE INDEX IF NOT EXISTS idx_products_sort_order        ON public.products         (sort_order);

CREATE INDEX IF NOT EXISTS idx_testimonials_featured      ON public.testimonials     (featured);
CREATE INDEX IF NOT EXISTS idx_testimonials_active        ON public.testimonials     (active);

CREATE INDEX IF NOT EXISTS idx_contact_requests_status    ON public.contact_requests (status);
CREATE INDEX IF NOT EXISTS idx_contact_requests_created   ON public.contact_requests (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_bookings_status            ON public.consultation_bookings (status);
CREATE INDEX IF NOT EXISTS idx_bookings_preferred_date    ON public.consultation_bookings (preferred_date);
CREATE INDEX IF NOT EXISTS idx_bookings_created           ON public.consultation_bookings (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_faqs_sort_order            ON public.faqs             (sort_order);
CREATE INDEX IF NOT EXISTS idx_faqs_active                ON public.faqs             (active);

CREATE INDEX IF NOT EXISTS idx_services_sort_order        ON public.services         (sort_order);
CREATE INDEX IF NOT EXISTS idx_team_members_sort_order    ON public.team_members     (sort_order);
CREATE INDEX IF NOT EXISTS idx_material_brands_sort_order ON public.material_brands  (sort_order);

CREATE INDEX IF NOT EXISTS idx_media_library_bucket       ON public.media_library    (bucket);

-- ============================================================
-- AUTO-UPDATE updated_at TRIGGER FUNCTION
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Apply trigger to all tables that have an updated_at column
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'users', 'projects', 'services', 'products', 'testimonials',
    'contact_requests', 'consultation_bookings', 'faqs', 'team_members',
    'material_brands', 'homepage_settings', 'media_library', 'website_settings'
  ] LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS trg_updated_at ON public.%I;
       CREATE TRIGGER trg_updated_at
       BEFORE UPDATE ON public.%I
       FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();',
      t, t
    );
  END LOOP;
END;
$$;

-- ============================================================
-- SEED: default homepage_settings row (singleton, safe to re-run)
-- ============================================================
INSERT INTO public.homepage_settings (
  hero_headline, hero_subheading, stats_projects_count, stats_clients_count, stats_years
) VALUES (
  'Designing Spaces That Feel Like Home. Crafted To Last.',
  'Bespoke residential and commercial interiors in Karnataka. We bring transparency, unhurried craftsmanship, and timeless quality to every project.',
  200, 150, 1
)
ON CONFLICT (singleton) DO NOTHING;

-- ============================================================
-- SEED: default website_settings (safe to re-run)
-- ============================================================
INSERT INTO public.website_settings (key, value, description) VALUES
  ('site_name',       'Modulyn Space',                             'Public website name'),
  ('site_email',      'hello@modulynspace.com',                    'Primary contact email'),
  ('site_phone',      '+91 98765 43210',                           'Primary contact phone'),
  ('site_address',    '123 Design Avenue, Bengaluru 560001',       'Studio address'),
  ('whatsapp_number', '919876543210',                              'WhatsApp number for CTA links'),
  ('instagram_url',   'https://instagram.com/modulynspace',        'Instagram profile URL'),
  ('facebook_url',    'https://facebook.com/modulynspace',         'Facebook page URL'),
  ('linkedin_url',    'https://linkedin.com/company/modulynspace', 'LinkedIn page URL')
ON CONFLICT (key) DO NOTHING;
-- ============================================================
-- Modulyn Space — Migration 002: Row Level Security Policies
-- Run AFTER 001_initial_schema.sql
-- ============================================================

-- ============================================================
-- HELPER FUNCTIONS
-- Defined first so all policies below can reference them safely
-- STABLE: function result does not change within a single query —
-- allows the planner to cache the result and avoid repeated lookups
-- SECURITY DEFINER: runs as the function owner, bypassing RLS on
-- the users table to prevent infinite recursion
-- ============================================================

CREATE OR REPLACE FUNCTION public.is_admin_or_editor()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
      AND role IN ('admin', 'editor')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
      AND role = 'admin'
  );
$$;

-- ============================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.users                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_images        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_requests      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultation_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.material_brands       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_settings     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_library         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_settings      ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- PUBLIC READ POLICIES
-- Unauthenticated visitors can read published / active content only
-- ============================================================

CREATE POLICY "public_read_projects"
  ON public.projects
  FOR SELECT
  USING (status IN ('in_progress', 'completed'));

-- Project images inherit visibility from their parent project
CREATE POLICY "public_read_project_images"
  ON public.project_images
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_images.project_id
        AND p.status IN ('in_progress', 'completed')
    )
  );

CREATE POLICY "public_read_active_services"
  ON public.services
  FOR SELECT
  USING (active = TRUE);

CREATE POLICY "public_read_active_products"
  ON public.products
  FOR SELECT
  USING (active = TRUE);

CREATE POLICY "public_read_active_testimonials"
  ON public.testimonials
  FOR SELECT
  USING (active = TRUE);

CREATE POLICY "public_read_active_faqs"
  ON public.faqs
  FOR SELECT
  USING (active = TRUE);

CREATE POLICY "public_read_active_team_members"
  ON public.team_members
  FOR SELECT
  USING (active = TRUE);

CREATE POLICY "public_read_active_brands"
  ON public.material_brands
  FOR SELECT
  USING (active = TRUE);

-- These tables are fully public for reading (no active filter needed)
CREATE POLICY "public_read_homepage_settings"
  ON public.homepage_settings
  FOR SELECT
  USING (TRUE);

CREATE POLICY "public_read_website_settings"
  ON public.website_settings
  FOR SELECT
  USING (TRUE);

-- ============================================================
-- PUBLIC WRITE POLICIES
-- Anonymous visitors can submit forms — no auth required
-- ============================================================

CREATE POLICY "public_insert_contact_requests"
  ON public.contact_requests
  FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "public_insert_consultation_bookings"
  ON public.consultation_bookings
  FOR INSERT
  WITH CHECK (TRUE);

-- ============================================================
-- USERS TABLE POLICIES
-- ============================================================

-- Admins have full control over all user records
CREATE POLICY "admin_all_users"
  ON public.users
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Any authenticated user can read their own profile
CREATE POLICY "user_read_own_profile"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile but cannot change their role
-- WITH CHECK prevents privilege escalation
CREATE POLICY "user_update_own_profile"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role = (SELECT role FROM public.users WHERE id = auth.uid())
  );

-- ============================================================
-- ADMIN / EDITOR FULL-ACCESS POLICIES
-- ============================================================

CREATE POLICY "admin_all_projects"
  ON public.projects
  FOR ALL
  USING (public.is_admin_or_editor())
  WITH CHECK (public.is_admin_or_editor());

CREATE POLICY "admin_all_project_images"
  ON public.project_images
  FOR ALL
  USING (public.is_admin_or_editor())
  WITH CHECK (public.is_admin_or_editor());

CREATE POLICY "admin_all_services"
  ON public.services
  FOR ALL
  USING (public.is_admin_or_editor())
  WITH CHECK (public.is_admin_or_editor());

CREATE POLICY "admin_all_products"
  ON public.products
  FOR ALL
  USING (public.is_admin_or_editor())
  WITH CHECK (public.is_admin_or_editor());

CREATE POLICY "admin_all_testimonials"
  ON public.testimonials
  FOR ALL
  USING (public.is_admin_or_editor())
  WITH CHECK (public.is_admin_or_editor());

CREATE POLICY "admin_all_contact_requests"
  ON public.contact_requests
  FOR ALL
  USING (public.is_admin_or_editor())
  WITH CHECK (public.is_admin_or_editor());

CREATE POLICY "admin_all_consultation_bookings"
  ON public.consultation_bookings
  FOR ALL
  USING (public.is_admin_or_editor())
  WITH CHECK (public.is_admin_or_editor());

CREATE POLICY "admin_all_faqs"
  ON public.faqs
  FOR ALL
  USING (public.is_admin_or_editor())
  WITH CHECK (public.is_admin_or_editor());

CREATE POLICY "admin_all_team_members"
  ON public.team_members
  FOR ALL
  USING (public.is_admin_or_editor())
  WITH CHECK (public.is_admin_or_editor());

CREATE POLICY "admin_all_material_brands"
  ON public.material_brands
  FOR ALL
  USING (public.is_admin_or_editor())
  WITH CHECK (public.is_admin_or_editor());

CREATE POLICY "admin_all_media_library"
  ON public.media_library
  FOR ALL
  USING (public.is_admin_or_editor())
  WITH CHECK (public.is_admin_or_editor());

-- Homepage and website settings are admin-only (not editors)
CREATE POLICY "admin_all_homepage_settings"
  ON public.homepage_settings
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "admin_all_website_settings"
  ON public.website_settings
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
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
