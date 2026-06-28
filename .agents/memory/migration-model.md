---
name: Migration execution model
description: How database migrations are applied in this project — manual only, no programmatic execution.
---

## Rule

All SQL migrations are run **manually** by the user via the Supabase Dashboard SQL Editor.

- Migration files: `artifacts/modulyn-space/supabase/migrations/`
  - `000_run_all.sql` — convenience file that references all others
  - `001_initial_schema.sql` — 14 tables, triggers, seeds
  - `002_rls_policies.sql` — RLS policies and helper functions
  - `003_storage_buckets.sql` — Storage bucket policies

**Why:** The project has no backend with service-role-key access. VITE_SUPABASE_ANON_KEY (client-side) cannot run DDL. The user explicitly manages the DB via SQL Editor.

## Important

- Never call migrations programmatically or try to run them from Node.js.
- Never ask for `SUPABASE_SERVICE_ROLE_KEY` for migration purposes.
- When schema changes are needed, update the migration files and tell the user which SQL to run.
