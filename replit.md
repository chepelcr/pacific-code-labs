# Pacific Code Labs DXP

A Digital Experience Platform for Pacific Code Labs — a Costa Rica-based technology company. Combines a polished public-facing marketing site with a full admin CMS panel, all driven by local JSON content files. 100% frontend-only (no backend/API required).

## Run & Operate

- `pnpm --filter @workspace/dxp run dev` — starts the DXP on port $PORT
- `pnpm --filter @workspace/dxp run typecheck` — typecheck the DXP

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Framework: React 18 + Vite 7
- Styling: TailwindCSS v4 + shadcn/ui
- Routing: wouter
- Translations: i18next + react-i18next (ES default, EN)
- State/CMS: Zustand admin store (zustand)
- Content: local JSON files in `src/content/`

## Where things live

- `artifacts/dxp/src/content/` — JSON content files (hero, products, services, caseStudies, faq, philosophy, languages, navigation, footer, seo, themes)
- `artifacts/dxp/src/translations/` — i18n files (es.json, en.json)
- `artifacts/dxp/src/lib/i18n.ts` — i18next init, default lang `es`, persisted in `localStorage("pcl-lang")`
- `artifacts/dxp/src/lib/admin-store.ts` — Zustand store, loads JSON on mount; `downloadJson()` helper for exporting
- `artifacts/dxp/src/repositories/` — typed read functions per entity (loads JSON)
- `artifacts/dxp/src/services/` — business logic layer (filter by status, sort by sortOrder)
- `artifacts/dxp/src/components/public/` — public website sections
- `artifacts/dxp/src/components/admin/` — AdminLayout, AdminSidebar, PageHeader
- `artifacts/dxp/src/pages/public/PublicWebsite.tsx` — public landing page
- `artifacts/dxp/src/pages/admin/AdminRouter.tsx` — admin route switching + layout
- `artifacts/dxp/src/pages/admin/` — all 16 admin pages

## Architecture decisions

- **No backend** — content lives in `src/content/*.json` files bundled with the app. The admin panel edits in-memory (Zustand) and exports updated JSON for repo commits. Contact form submissions persist to `localStorage("pcl-contact-messages")`.
- **Content export flow**: Admin edits → Zustand store update → "Export JSON" button → `downloadJson()` → file downloaded → committed to repo → next build picks up changes.
- **i18n**: Default Spanish, toggleable to English via navbar/admin. Language stored in `localStorage("pcl-lang")`.
- **Routes**: Public site at `/`, admin panel at `/admin/*`. Admin sidebar has collapsible support.
- **Brand colors**: Midnight Navy #0F172A · Tech Blue #2563EB · Electric Cyan #06B6D4 · Emerald #10B981 · BG #F8FAFC

## Product

**Public Site** (scrollable landing page):
- Hero, Products (Tsuru + FireCode CR), Services (5 areas), About, Philosophy (3 pillars), Case Studies, FAQ accordion, Contact form

**Admin Panel** (/admin/*):
- Business: Dashboard, Products, Services, Case Studies, FAQ, Contact Messages, SEO, Navigation, Footer
- CMS: Languages, Themes, Media Library, Content Versions (download all JSON), Settings
- Platform: Content Explorer (live JSON tree), Diagnostics

## User preferences

- 100% frontend-only — no server, no database. JSON files + browser state only.
- Admin panel is for local use; "save" = download JSON and commit to repo.

## Gotchas

- When editing content in admin: changes live in Zustand state (in-memory) and are NOT auto-persisted to JSON files. Must click "Export JSON" and commit the file.
- Contact messages persist to localStorage only — they survive page reloads but not device changes.
- Typecheck with `pnpm --filter @workspace/dxp run typecheck` (not build — build needs workflow-provided env vars).
