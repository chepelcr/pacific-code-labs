/**
 * Whether the admin CMS panel (`/admin/*`) is available in this build.
 *
 * The admin panel is a local-authoring tool with no authentication — it edits
 * content in-memory and exports JSON for commits (see `replit.md`). It must
 * therefore NEVER ship in a public production build (e.g. GitHub Pages).
 *
 * - In `vite` dev (`pnpm --filter @workspace/dxp run dev`), `import.meta.env.DEV`
 *   is `true`, so admin is enabled.
 * - In a production build, `import.meta.env.DEV` is `false`, so admin is gated
 *   off: its routes are not registered and the navbar link is hidden.
 * - To intentionally ship an admin-enabled build (e.g. an internal preview),
 *   build with `VITE_ENABLE_ADMIN=true`.
 */
export const ADMIN_ENABLED: boolean =
  import.meta.env.DEV || import.meta.env.VITE_ENABLE_ADMIN === "true";
