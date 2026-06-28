-- ============================================================
-- Modulyn Space — Migration 004: Products Extra Fields
-- Run AFTER 001_initial_schema.sql
-- Adds finish, dimensions, delivery_timeline columns to products
-- ============================================================

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS finish            TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS dimensions        TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS delivery_timeline TEXT;
