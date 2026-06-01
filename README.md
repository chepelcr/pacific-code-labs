# Pacific Code Labs DXP

A Digital Experience Platform for **Pacific Code Labs**, a Costa Rica–based
technology company. It combines a polished public marketing site with a full
admin CMS panel — all driven by local JSON content files, with **no backend
required at runtime**.

🌐 **Live:** https://pacific-code-labs.jcampos.dev

## Tech stack

- **pnpm** workspaces · **Node.js 24** · **TypeScript 5.9**
- **React 18** + **Vite 7**
- **TailwindCSS v4** + **shadcn/ui** (Radix primitives)
- Routing: **wouter** · State/CMS: **Zustand**
- i18n: **i18next** / **react-i18next** (Spanish default, English toggle)
- Content: local JSON files bundled with the app

## Repository layout

This is a pnpm monorepo. The deployed product is `artifacts/dxp`.

| Package | Path | Purpose |
| --- | --- | --- |
| `@workspace/dxp` | `artifacts/dxp` | **The product** — public site + admin CMS (ships to GitHub Pages) |
| `@workspace/api-server` | `artifacts/api-server` | Optional Express backend (not part of the Pages deploy) |
| `@workspace/mockup-sandbox` | `artifacts/mockup-sandbox` | Design/prototype sandbox |
| `@workspace/db` | `lib/db` | Drizzle ORM schema/connection |
| `@workspace/api-spec` · `api-zod` · `api-client-react` | `lib/*` | Shared API spec, Zod schemas, React client |

## Getting started

> Requires **Node 24** and **pnpm 10**. (`npm`/`yarn` are blocked by a preinstall guard.)

```bash
pnpm install

# Run the DXP locally (admin panel enabled in dev)
PORT=5000 BASE_PATH=/ pnpm --filter @workspace/dxp run dev
```

`vite.config.ts` requires both `PORT` and `BASE_PATH` to be set — including for builds.

### Build

```bash
NODE_ENV=production PORT=5000 BASE_PATH=/ pnpm --filter @workspace/dxp run build
# Output: artifacts/dxp/dist/public
```

### Typecheck

```bash
pnpm --filter @workspace/dxp run typecheck
```

## Content & the admin panel

The site reads content from `artifacts/dxp/src/content/*.json`. The admin panel
(`/admin/*`) edits that content **in memory** (Zustand) and lets you **Export
JSON** to download updated files, which you then commit. The next build picks up
the changes.

> The admin panel has no authentication and is a **local authoring tool only**.
> It is automatically **excluded from production builds** (see below).

## Admin is disabled in production

`src/lib/admin-enabled.ts` exposes `ADMIN_ENABLED`, which is `true` only in dev
(or when explicitly built with `VITE_ENABLE_ADMIN=true`). In a normal production
build it folds to a constant `false`, so the admin routes, the navbar link, and
the entire admin panel are **tree-shaken out of the shipped bundle**. Visiting
`/admin` on the live site falls through to the 404/redirect to home.

To intentionally produce an admin-enabled build (e.g. an internal preview):

```bash
VITE_ENABLE_ADMIN=true NODE_ENV=production PORT=5000 BASE_PATH=/ \
  pnpm --filter @workspace/dxp run build
```

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which:

1. Installs the DXP and its workspace dependencies (filtered install).
2. Builds the production bundle with the admin panel disabled.
3. Writes a `CNAME` for the custom domain and a `404.html` SPA fallback.
4. Publishes `artifacts/dxp/dist/public` to **GitHub Pages**.

**One-time setup:** in the repo settings, set **Settings → Pages → Source** to
**GitHub Actions**, and point the `pacific-code-labs.jcampos.dev` DNS record
(CNAME) at GitHub Pages.

## License

[MIT](./LICENSE) © Pacific Code Labs
