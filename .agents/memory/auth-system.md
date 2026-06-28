---
name: Auth system design
description: How Supabase auth is wired into the admin panel — context placement, role model, and key decisions.
---

## Structure

- `AuthProvider` lives inside `AdminApp` (not `App`), so auth is only initialized for `/admin/*` routes.
- `/admin/login` is a public route inside AdminApp — rendered before `ProtectedRoute`, no AdminLayout wrapper.
- All other `/admin/*` routes are wrapped in `ProtectedRoute` which redirects to `/admin/login` when no session.
- `AdminHeader` and `AdminSidebar` both call `useAuth()` — they work because they're rendered inside `AdminLayout`, which is inside `ProtectedRoute`, which is inside `AuthProvider`.

## Role model

- Roles: `admin`, `editor`, `viewer` — stored in `public.users.role`.
- `admin`: full access to all routes including `/admin/users` and `/admin/settings`.
- `editor`: all content routes; Settings and Users nav items hidden.
- `viewer`: same nav as editor but all content is read-only (enforced by RLS, not frontend only).
- Helper functions: `canEdit(role)` and `isAdmin(role)` in `AuthContext.tsx`.

## Session management

- `supabase.auth.getSession()` on mount for initial restore.
- `onAuthStateChange` subscription for live login/logout/token refresh.
- `hydrateUser()` fetches `public.users` row for full_name, avatar_url, role after session is confirmed.
- If `public.users` row missing or table doesn't exist: silently defaults to `role: 'viewer'`.

## Auth trigger

- `trg_on_auth_user_created` in `001_initial_schema.sql` auto-creates `public.users` row (role='viewer') when Supabase creates an auth user.
- To make admin: `UPDATE public.users SET role = 'admin' WHERE id = '<uuid>';`

**Why:** Keeping AuthProvider in AdminApp (not App) means the public website never initializes Supabase auth session checks, keeping public page load lean.
