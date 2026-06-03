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

### Local dev scripts (repo root)

Convenience wrappers for running the DXP locally on Windows/Git-Bash — prefer
these over the raw `pnpm` command:

```bash
./reboot-server.sh   # (re)start the dev server on :5000 in the background → logs/dxp.log
./view-logs.sh       # tail logs/dxp.log
./stop-server.sh     # kill whatever is listening on :5000
```

`reboot-server.sh` frees port 5000, clears the Vite cache, and launches
`@workspace/dxp run dev` detached. It also fixes two Git-Bash gotchas this
machine has (see below), so on Windows **always start the server with it**
rather than the bare `pnpm … run dev`:

- exports `MSYS_NO_PATHCONV=1` so `BASE_PATH=/` isn't rewritten to a Windows path
  (`MSYS2_ARG_CONV_EXCL` does **not** help — it only excludes argv, not env values);
- strips stray surrounding quotes from `COREPACK_HOME`/`PNPM_HOME`/`npm_config_*`
  and puts `PNPM_HOME` on `PATH` (pnpm lives on the E: disk here).

### Publishing edits from the admin (no terminal needed)

With the dev server running, the admin topbar (`AdminTopbar.tsx`) has a
**Publish** button: it `git add`s `src/content` + `src/translations` + `public`,
commits with an auto message, and `git push`es the **current branch**, via the
dev-only `POST /__local/publish` endpoint in `vite-plugin-local-cms.ts`. So keep
the local checkout on `main` when authoring — Publish pushes `main`, which the
deploy workflow turns into a Pages release. The **Diagnostics** page shows recent
commits (paginated) from the read-only `GET /__local/git-log` endpoint. Both
endpoints are `apply: "serve"` + local-host only, so they never ship.

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
footer→FooterPage, legal→LegalPagesPage, seo→SeoPage, languages→LanguagesPage,
settings→SettingsPage, inventory→InventoryPage, media→MediaPage. **Site Identity**
(`/admin/identity`, `BrandingPage.tsx`) edits **both** branding→branding.json and
themes→themes.json on one page with a combined dirty/save (the old `/admin/themes`
and `/admin/branding` routes redirect there; there is no standalone ThemesPage).
Contact messages → ContactPage (localStorage only).

`branding.json` and `themes.json` actually **drive the live site**: `src/lib/brand-theme.ts`
(`initBrand`, called from `main.tsx`) applies the active theme's palette to CSS variables
(brand hex tokens + light-mode semantic tokens) and points the favicon at `branding.faviconUrl`;
`Logo.tsx` reads `branding` (logo/companyName) via `src/repositories/branding.repository.ts`.
Images everywhere are editable through the `MediaPicker` (`src/components/admin/MediaPicker.tsx`)
backed by the media library (`media.json`): pick-from-library / upload-from-disk (writes
`public/media/` via the dev `/__local/asset` endpoint, which now also accepts video/audio and a
`dir`) / paste external URL. Local refs are root-relative paths resolved by `src/lib/media.ts`
(`resolveAssetUrl`/`resolveMediaUrl`/`mediaRef`/`absoluteAssetUrl`, the last for OG/sitemap).

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
- Routing: `wouter` (path-based, no `#` hashes), base derived from `import.meta.env.BASE_URL`. Public URLs are **language-prefixed** (`/es`, `/en/products`, …); `/` and legacy un-prefixed paths redirect to the default language, and the URL language drives i18n (`App.tsx` + `src/lib/sections.ts` helpers: `localizedPath`, `localizeHref`, `pathLang`, `pathToSectionId`). The landing page is one scrollable document; each section slug maps to its element `id`. `PublicWebsite` smooth-scrolls to the matching section on every location change (nav clicks, deep links, back/forward), and scroll-spy rewrites the URL under the active language. Use the `sections.ts` helpers for any internal link so it stays language-prefixed. Section anchors get `scroll-margin-top` (in `index.css`) so the fixed navbar doesn't cover them.
- Styling: TailwindCSS v4 + shadcn/ui. Theme toggle persisted in `localStorage("pcl-theme")`. Native scrollbars are brand-themed globally in `index.css` (`@layer base`, driven by `--muted-foreground` so they adapt to light/dark).
- Brand colors: Midnight Navy `#0F172A` · Tech Blue `#2563EB` · Electric Cyan `#06B6D4` · Emerald `#10B981` · BG `#F8FAFC`.

## Deployment

`.github/workflows/deploy.yml` builds `@workspace/dxp` on push to `main` and
publishes `artifacts/dxp/dist/public` to GitHub Pages. It writes a `CNAME`
(`pacific-code-labs.jcampos.dev`) and copies `index.html` → `404.html` for SPA
deep-link fallback. `VITE_ENABLE_ADMIN` is deliberately left unset so the admin
panel is excluded.

## SEO

Two layers, both driven by the editable **`src/content/seo.json`** (site URL, default
title/description, OG image, and a `pages` map of per-route title/description, all
bilingual — edited in **SeoPage**):

Public URLs are **language-prefixed**: `/es`, `/en`, `/es/products`, `/en/privacy`, …
`/` redirects to the default language; legacy un-prefixed paths redirect too (see
`App.tsx` + the helpers in `src/lib/sections.ts`). The URL language drives i18n.

- **Static (crawlers/social/AI that don't run JS):** `scripts/prerender.mjs` runs after
  `vite build` (wired into the `build` script) and writes a static
  `dist/public/<lang>/<slug>/index.html` for **every language × route** (home, section
  deep-links, legal) — each with its own `<title>`, description, canonical, **hreflang
  alternates (es/en/x-default)**, OG/Twitter, `<html lang>`, and JSON-LD (`WebPage` +
  `BreadcrumbList`, plus `FAQPage` on home/`/contact`). It also generates
  `dist/public/sitemap.xml` (hreflang alternates), a root `index.html` canonical-ing to
  the default language, and a **noindex `404.html`** SPA fallback. The base `index.html`
  carries `Organization` + `WebSite` JSON-LD.
- **Runtime (SPA navigation):** `src/lib/seo.ts` (`resolveSeo` + `useHeadTags`) updates
  `document.title`/meta/canonical/hreflang as users navigate, from the same `seo.json`.
  Applied in `PublicWebsite`, `LegalPage`, and `not-found` (404 → noindex).
- Also: `public/robots.txt` (+ `Sitemap:`). The sitemap itself is **generated by
  prerender**, not committed.

**When you add/rename a public route** (`src/lib/sections.ts` + legal): add it to
`seo.json` `pages` and the `routes` list in `scripts/prerender.mjs` — the sitemap and
hreflang follow automatically. Keep JSON-LD consistent with visible content (avoid
"schema drift").

**IndexNow** is wired: `public/<key>.txt` holds the key and the deploy workflow POSTs
all language URLs to `api.indexnow.org` after each deploy (Bing/Yandex/AI). Update the
`SLUGS` list in `deploy.yml` if routes change.

**Analytics**: `src/components/Analytics.tsx` loads GA4 only when `seo.json`
`googleAnalyticsId` (a `G-XXXXXXXXXX` Measurement ID, set in admin → SEO) is present, and
sends a `page_view` per SPA navigation. No ID → nothing loads.

Manual, off-repo follow-ups: verify in Google Search Console + Bing Webmaster Tools and
submit the sitemap. Ranking for competitive non-brand terms needs off-page work
(content, backlinks, E-E-A-T) — the repo only covers the technical foundation.

## Gotchas

- Editing content in admin does **not** auto-persist to JSON — must Export JSON and commit.
- Native build deps (`@rollup/*`, `lightningcss`, `@tailwindcss/oxide`) are platform-specific. The lockfile carries the Linux binaries (CI target); installing on other OSes may pull additional platform packages.
- `pnpm-workspace.yaml` sets `minimumReleaseAge: 1440` (supply-chain defense). **Do not disable it.**
