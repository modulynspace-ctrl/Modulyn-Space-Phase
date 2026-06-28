-- ============================================================
-- Modulyn Space — Migration 003: Products extra columns
-- Run in: Supabase Dashboard → SQL Editor
--
-- Adds three columns referenced by the Products CMS form
-- that were missing from the initial schema:
--   delivery_timeline — e.g. "8–12 weeks"
--   finish            — e.g. "Matte Lacquer"
--   dimensions        — e.g. "W 220 × D 90 × H 75 cm"
-- ============================================================

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS delivery_timeline TEXT,
  ADD COLUMN IF NOT EXISTS finish            TEXT,
  ADD COLUMN IF NOT EXISTS dimensions        TEXT;
