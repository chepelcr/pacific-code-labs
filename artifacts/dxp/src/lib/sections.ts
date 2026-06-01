/**
 * Public landing page is a single scrollable document. Each section is
 * addressable by a clean path (e.g. `/products`) that maps 1:1 to the section
 * element's `id`. The home path `/` maps to the hero/top.
 *
 * Routing is path-based (History API via wouter) — no `#` hash anchors. The
 * router renders `PublicWebsite` for every section path, and `PublicWebsite`
 * smooth-scrolls to the matching section whenever the location changes (so
 * nav clicks, deep links, and back/forward all work).
 */

/** Section slugs in document order. Slug === URL path segment === element id. */
export const SECTION_SLUGS = [
  "products",
  "services",
  "about",
  "philosophy",
  "case-studies",
  "contact",
] as const;

export type SectionSlug = (typeof SECTION_SLUGS)[number];

/** All valid public paths, including home. */
export const PUBLIC_PATHS = ["/", ...SECTION_SLUGS.map((s) => `/${s}`)];

/** Map a router location to the id of the element to scroll to. */
export function pathToSectionId(path: string): string {
  const slug = path.replace(/^\//, "").replace(/\/$/, "");
  return slug || "hero";
}
