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
about→AboutPage, products→ProductsPage, services→ServicesPage, caseStudies→CaseStudiesPage,
philosophy→PhilosophyPage, faq→FaqPage, navigation→NavigationPage,
footer→FooterPage, legal→LegalPagesPage, seo→SeoPage, branding→BrandingPage,
languages→LanguagesPage, themes→ThemesPage, settings→SettingsPage,
inventory→InventoryPage. Contact messages → ContactPage (localStorage only).

The i18n strings in `translations/{es,en}.json` are editable via **TranslationsPage**
(`/admin/translations`): a flattened key table with live preview
(`i18n.addResourceBundle`) and `es.json`/`en.json` export. LanguagesPage manages
language *metadata* only. So translatable UI chrome lives in the translation
files (editable there) and per-entity copy lives in `content/*.json`.

### Bilingual editing & auto-translation

Admin content pages edit **both languages side by side** (Spanish | English) —
there is no single "editing language" toggle. Use the bilingual primitives in
`src/components/admin/AdminUI.tsx`: `BilingualField` / `BilingualTextArea` (props
`es`, `en`, `onChange(lang, value)`) wrapped in a `BilingualSection`. Do **not**
reintroduce a per-page language toggle or read `translations[lang]` for editing —
write `translations.es` and `translations.en` directly.

Auto-translation runs **on-device** via the Chrome built-in Translator API
(`src/lib/translate.ts`, `translateText` / `translatorSupported`). It is gated by
`content/settings.json` (`autoTranslate.enabled` / `fillEmptyOnBlur`, edited in
SettingsPage). When enabled, a field auto-fills the empty opposite side on blur,
and each `BilingualSection` shows a button that fills every blank target. It
degrades silently where the API is unavailable (non-Chrome, non-secure context) —
admin is dev-only, so this is fine. Rich-text markup tokens (`{{}}`, `[[]]`,
`**`) may need a manual pass after translating.

### Inventory map (keep regenerated)

`src/content/inventory.json` maps every DXP `src/` module and its import
relationships (`{ nodes, edges }`); InventoryPage (`/admin/inventory`) renders it
as an interactive pan/zoom graph. It is produced by
`artifacts/dxp/scripts/build-inventory.mjs`. **Whenever you add, remove, or
rename a file/component under `artifacts/dxp/src`, regenerate it** with
`pnpm --filter @workspace/dxp run inventory` so the map stays accurate.

## Where things live (DXP)

- `src/content/*.json` — content (hero, about, products, services, caseStudies, faq, philosophy, navigation, footer, legal, seo, branding, languages, themes, settings, inventory).
- `src/translations/{es,en}.json` — i18n strings. Default `es`, persisted in `localStorage("pcl-lang")`.
- `src/lib/i18n.ts` — i18next init. `src/lib/admin-store.ts` — Zustand store + `downloadJson()` export helper. `src/lib/icons.ts` — editable-icon registry. `src/lib/sections.ts` — landing section slugs/paths.
- `src/repositories/` — typed JSON readers per entity. `src/services/` — business logic (filter/sort).
- `src/components/public/` — public sections. `src/components/admin/` — AdminLayout/Sidebar/PageHeader.
- `src/pages/public/PublicWebsite.tsx` — landing page; `src/pages/public/LegalPage.tsx` — `/privacy` & `/terms`. `src/pages/admin/AdminRouter.tsx` + `src/pages/admin/*` — admin pages.

## Architecture notes

- **No backend at runtime.** Content is bundled JSON. Admin edits live in Zustand; "save" = click **Export JSON** → `downloadJson()` → commit the file → next build picks it up.
- Contact form: always logs to `localStorage("pcl-contact-messages")`, and (since the site is serverless on Pages) **delivers off-device through a configurable third-party form provider** — `settings.json` `contact.{provider,endpoint,accessKey}`, edited in SettingsPage, sent via `src/lib/contact.ts` (`submitContact`). Providers: `formsubmit`/`web3forms`/`formspree`/`custom`/`none`.
- Routing: `wouter` (path-based, no `#` hashes), base derived from `import.meta.env.BASE_URL`. The landing page is one scrollable document; each section has a clean path (`/products`, `/services`, …) that maps to its element `id` via `src/lib/sections.ts`. `PublicWebsite` smooth-scrolls to the matching section on every location change, so nav clicks, deep links, and back/forward all work. Section anchors get `scroll-margin-top` (in `index.css`) so the fixed navbar doesn't cover them.
- Styling: TailwindCSS v4 + shadcn/ui. Theme toggle persisted in `localStorage("pcl-theme")`. Native scrollbars are brand-themed globally in `index.css` (`@layer base`, driven by `--muted-foreground` so they adapt to light/dark).
- Brand colors: Midnight Navy `#0F172A` · Tech Blue `#2563EB` · Electric Cyan `#06B6D4` · Emerald `#10B981` · BG `#F8FAFC`.

## Deployment

`.github/workflows/deploy.yml` builds `@workspace/dxp` on push to `main` and
publishes `artifacts/dxp/dist/public` to GitHub Pages. It writes a `CNAME`
(`pacific-code-labs.jcampos.dev`) and copies `index.html` → `404.html` for SPA
deep-link fallback. `VITE_ENABLE_ADMIN` is deliberately left unset so the admin
panel is excluded.

## SEO

- Static crawl signals live in `artifacts/dxp/index.html` (title/description, canonical,
  Open Graph + Twitter with absolute `opengraph.jpg`, `theme-color`, and JSON-LD
  `Organization` + `WebSite`) plus `public/robots.txt` and `public/sitemap.xml`. The
  deploy copies `index.html` → `404.html`, so these reach every deep link.
- **When you add/rename a public route** (see `src/lib/sections.ts` + legal pages),
  update `public/sitemap.xml` (and bump `lastmod`).
- Keep JSON-LD values consistent with visible content (avoid "schema drift").
- Per-route `<title>`/meta is not injected at runtime yet (no head manager); `seo.json`
  is editable but only mirrored into the static `index.html` by hand. Manual follow-ups
  (not in repo): verify in Google Search Console + Bing Webmaster Tools, submit the
  sitemap, and optionally wire IndexNow for Bing/AI engines.

## Gotchas

- Editing content in admin does **not** auto-persist to JSON — must Export JSON and commit.
- Native build deps (`@rollup/*`, `lightningcss`, `@tailwindcss/oxide`) are platform-specific. The lockfile carries the Linux binaries (CI target); installing on other OSes may pull additional platform packages.
- `pnpm-workspace.yaml` sets `minimumReleaseAge: 1440` (supply-chain defense). **Do not disable it.**
