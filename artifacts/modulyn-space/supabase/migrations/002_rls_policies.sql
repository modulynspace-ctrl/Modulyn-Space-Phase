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
