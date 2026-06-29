-- ============================================================
-- Modulyn Space — Migration 004: Company Logo URL
-- Run in: Supabase Dashboard → SQL Editor
--
-- Adds the company_logo_url key to the website_settings
-- key-value store. The value defaults to NULL (no logo),
-- which causes the Navbar to fall back to text-only branding.
-- ============================================================

INSERT INTO public.website_settings (key, value, description)
VALUES (
  'company_logo_url',
  NULL,
  'Company logo URL (PNG, SVG, or WebP with transparent background). Shown in the Navbar beside the company name.'
)
ON CONFLICT (key) DO NOTHING;
