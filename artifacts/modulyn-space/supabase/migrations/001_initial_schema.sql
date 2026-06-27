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
  status            TEXT        NOT NULL DEFAULT 'planning'
                               CHECK (status IN ('planning', 'in_progress', 'completed')),
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
                           CHECK (status IN ('new', 'replied', 'closed')),
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
