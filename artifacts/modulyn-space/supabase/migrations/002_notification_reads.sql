-- ============================================================
-- Modulyn Space — Migration 002: Notification Reads
-- Run in: Supabase Dashboard → SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS public.notification_reads (
  id        UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source    TEXT        NOT NULL CHECK (source IN ('contact_request', 'consultation_booking')),
  source_id UUID        NOT NULL,
  read_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, source, source_id)
);

CREATE INDEX IF NOT EXISTS idx_notif_reads_user
  ON public.notification_reads (user_id);

CREATE INDEX IF NOT EXISTS idx_notif_reads_source
  ON public.notification_reads (source, source_id);

-- ── RLS ───────────────────────────────────────────────────────────────────────
-- Each user can only see and manage their own read records.

ALTER TABLE public.notification_reads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notif_reads_select_own"
  ON public.notification_reads
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "notif_reads_insert_own"
  ON public.notification_reads
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "notif_reads_delete_own"
  ON public.notification_reads
  FOR DELETE
  USING (auth.uid() = user_id);
