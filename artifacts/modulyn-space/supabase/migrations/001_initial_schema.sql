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
