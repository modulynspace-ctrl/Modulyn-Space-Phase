# Modulyn Space

A luxury interior design studio website for Modulyn Space — a premium residential and commercial interior design firm based in Karnataka, India.

## Run & Operate

- `pnpm --filter @workspace/modulyn-space run dev` — run the frontend (assigned port via $PORT)
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS v4 + Framer Motion
- Routing: wouter
- API: Express 5 (api-server artifact, not used by this frontend)
- Fonts: Playfair Display (headings), Poppins (body) via Google Fonts

## Where things live

- `artifacts/modulyn-space/` — main frontend app
- `artifacts/modulyn-space/src/pages/` — Home, Projects, ProjectDetail, Story, Contact, Store
- `artifacts/modulyn-space/src/components/` — Navbar, Footer, LoadingScreen
- `artifacts/modulyn-space/src/index.css` — theme tokens (bronze/champagne palette)
- `attached_assets/` — AI-generated interior & product images (referenced via @assets alias)

## Architecture decisions

- Frontend-only — no backend, no database, no authentication
- All images are AI-generated and stored in `attached_assets/`, served via Vite `@assets` alias
- Vite `fs.allow` is explicitly set to include both the artifact root and `attached_assets/` (required since attached_assets is outside the artifact root)
- Home page is imported directly (not lazy-loaded) to avoid Suspense null flash on first load
- AnimatePresence mode="wait" manages the 1.5s premium loading screen transition

## Product

Multi-page luxury interior design studio site with:
- Homepage with 12 sections (hero, services, process, testimonials, FAQ, CTA)
- Projects portfolio with individual project detail pages (before/after, gallery)
- Our Story editorial page
- Contact page with validated form
- Modulyn Store furniture catalogue with category filtering

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- The `@assets` Vite alias points to `../../attached_assets` (outside artifact root). `fs.allow` in vite.config.ts MUST include that path or images won't load.
- Don't lazy-load the Home page — it causes a null flash during Suspense that makes the hero appear blank in screenshots and on initial load.
- Google Fonts `@import url(...)` MUST be the first line of index.css before `@import "tailwindcss"` or PostCSS fails silently.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
