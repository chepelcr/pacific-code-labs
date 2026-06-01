# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this is

**Pacific Code Labs DXP** — a Digital Experience Platform for a Costa Rica–based
technology company. It pairs a polished public marketing site with a full admin
CMS panel, driven entirely by local JSON content files. The deployed product is
**100% frontend** (no backend/API required at runtime).

Public site is deployed to GitHub Pages at **https://pacific-code-labs.jcampos.dev**.

## Monorepo layout

pnpm workspace (Node 24, TypeScript 5.9, pnpm 10). Packages:

- `artifacts/dxp` (`@workspace/dxp`) — **the product**: React 18 + Vite 7 SPA. This is what ships to GitHub Pages.
- `artifacts/api-server` (`@workspace/api-server`) — Express 5 backend. Optional; **not** part of the Pages deploy.
- `artifacts/mockup-sandbox` (`@workspace/mockup-sandbox`) — design/prototype sandbox.
- `lib/db` (`@workspace/db`) — Drizzle ORM schema/connection.
- `lib/api-spec`, `lib/api-zod`, `lib/api-client-react` — shared API spec, Zod schemas, and React client.
- `scripts` (`@workspace/scripts`) — workspace tooling (e.g. `post-merge.sh`).

> The DXP lists `@workspace/api-client-react` as a dependency but does not import
> it in `src/` — the shipped site reads content from bundled JSON only.

## Commands

Always use **pnpm** (a `preinstall` guard rejects npm/yarn).

```bash
# Dev server for the DXP (admin panel ENABLED in dev)
PORT=5000 BASE_PATH=/ pnpm --filter @workspace/dxp run dev

# Typecheck the DXP
pnpm --filter @workspace/dxp run typecheck

# Production build (admin panel DISABLED — see below)
NODE_ENV=production PORT=5000 BASE_PATH=/ pnpm --filter @workspace/dxp run build
# → output: artifacts/dxp/dist/public
```

- `vite.config.ts` **requires** both `PORT` and `BASE_PATH` env vars, even for `build`. Builds throw without them.
- `BASE_PATH` is the Vite `base`: `/` for the custom domain (apex of the subdomain); `/<repo>/` for a default github.io project site.

## Admin panel is gated out of production

The admin CMS (`/admin/*`) has **no authentication** — it edits content in
memory and exports JSON for commits. It must never ship publicly.

`artifacts/dxp/src/lib/admin-enabled.ts` exports `ADMIN_ENABLED`, which is
`true` only in Vite dev (`import.meta.env.DEV`) or when built with
`VITE_ENABLE_ADMIN=true`. In a normal production build it is statically `false`,
so:

- `App.tsx` does not register the `/admin` routes (they 404).
- `PublicNavbar.tsx` hides the "Admin" link.
- `AdminRouter.tsx` redirects to `/` as defense in depth.

Because the gate folds to a constant `false` at build time, Rollup tree-shakes
the entire admin panel out of the production bundle. **Do not weaken this gate**
(e.g. by registering admin routes unconditionally). If you add admin entry
points, guard them with `ADMIN_ENABLED`.

## NO hardcoded user-visible text — everything must be editable

**Hard rule:** every user-visible string on the public site must come from an
editable source — either a `src/content/*.json` file or an i18n key via
`t("...")` (`src/translations/{es,en}.json`). **Never** put a visible literal
directly in a component, and **never** use bilingual ternaries like
`lang === "es" ? "Activo" : "Active"` (that bypasses the content system).

- Per-entity copy that an editor manages (hero eyebrow/stats, product taglines, legal body…) → `src/content/*.json`, with an admin page to edit it.
- Fixed UI chrome / labels shared across the site → i18n keys in `src/translations/{es,en}.json`.
- Selectable icons are editable too: store an `iconName` in content and resolve it through `src/lib/icons.ts` (the icon registry / `resolveIcon`). Do **not** hardcode emoji or icon-per-id maps in components.
- The only acceptable in-component literals are non-content tokens: `data-testid`, class names, decorative `aria-hidden` SVGs, and the brand name "Pacific Code Labs".

When you add any new visible text, add it to content/translations and wire an
admin editor for it. Run the audit mindset: grep `src/components/public` and
`src/pages/public` for string literals before shipping.

### Content ↔ admin mapping (keep complete)

Every `src/content/*.json` entity has a matching admin page, is in `AdminSidebar`,
is routed in `AdminRouter`, and is downloadable from `ContentVersionsPage`. When
you add a content file you MUST add all four. Current map: hero→HeroPage,
products→ProductsPage, services→ServicesPage, caseStudies→CaseStudiesPage,
philosophy→PhilosophyPage, faq→FaqPage, navigation→NavigationPage,
footer→FooterPage, legal→LegalPagesPage, seo→SeoPage, branding→BrandingPage,
languages→LanguagesPage, themes→ThemesPage. Contact messages → ContactPage
(localStorage only).

> **Known gap:** the i18n strings in `translations/{es,en}.json` have no admin
> editor (LanguagesPage only manages language metadata). They are edited in the
> files directly. If asked to make translations editable, add a translations
> admin page.

## Where things live (DXP)

- `src/content/*.json` — content (hero, products, services, caseStudies, faq, philosophy, navigation, footer, legal, seo, branding, languages, themes).
- `src/translations/{es,en}.json` — i18n strings. Default `es`, persisted in `localStorage("pcl-lang")`.
- `src/lib/i18n.ts` — i18next init. `src/lib/admin-store.ts` — Zustand store + `downloadJson()` export helper. `src/lib/icons.ts` — editable-icon registry. `src/lib/sections.ts` — landing section slugs/paths.
- `src/repositories/` — typed JSON readers per entity. `src/services/` — business logic (filter/sort).
- `src/components/public/` — public sections. `src/components/admin/` — AdminLayout/Sidebar/PageHeader.
- `src/pages/public/PublicWebsite.tsx` — landing page; `src/pages/public/LegalPage.tsx` — `/privacy` & `/terms`. `src/pages/admin/AdminRouter.tsx` + `src/pages/admin/*` — admin pages.

## Architecture notes

- **No backend at runtime.** Content is bundled JSON. Admin edits live in Zustand; "save" = click **Export JSON** → `downloadJson()` → commit the file → next build picks it up.
- Contact form submissions persist to `localStorage("pcl-contact-messages")` only.
- Routing: `wouter` (path-based, no `#` hashes), base derived from `import.meta.env.BASE_URL`. The landing page is one scrollable document; each section has a clean path (`/products`, `/services`, …) that maps to its element `id` via `src/lib/sections.ts`. `PublicWebsite` smooth-scrolls to the matching section on every location change, so nav clicks, deep links, and back/forward all work. Section anchors get `scroll-margin-top` (in `index.css`) so the fixed navbar doesn't cover them.
- Styling: TailwindCSS v4 + shadcn/ui. Theme toggle persisted in `localStorage("pcl-theme")`.
- Brand colors: Midnight Navy `#0F172A` · Tech Blue `#2563EB` · Electric Cyan `#06B6D4` · Emerald `#10B981` · BG `#F8FAFC`.

## Deployment

`.github/workflows/deploy.yml` builds `@workspace/dxp` on push to `main` and
publishes `artifacts/dxp/dist/public` to GitHub Pages. It writes a `CNAME`
(`pacific-code-labs.jcampos.dev`) and copies `index.html` → `404.html` for SPA
deep-link fallback. `VITE_ENABLE_ADMIN` is deliberately left unset so the admin
panel is excluded.

## Gotchas

- Editing content in admin does **not** auto-persist to JSON — must Export JSON and commit.
- Native build deps (`@rollup/*`, `lightningcss`, `@tailwindcss/oxide`) are platform-specific. The lockfile carries the Linux binaries (CI target); installing on other OSes may pull additional platform packages.
- `pnpm-workspace.yaml` sets `minimumReleaseAge: 1440` (supply-chain defense). **Do not disable it.**
