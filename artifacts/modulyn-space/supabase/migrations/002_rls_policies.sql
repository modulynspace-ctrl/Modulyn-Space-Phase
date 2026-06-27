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
