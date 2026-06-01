import { useEffect } from "react";
import seoData from "@/content/seo.json";
import legalData from "@/content/legal.json";
import { LANGUAGES, isLang, localizedPath, getDefaultLang } from "@/lib/sections";

/**
 * Runtime <head> management for the SPA. Keeps the browser tab title and meta
 * tags (incl. canonical + hreflang alternates) in sync as users navigate
 * client-side, sourced from the editable seo.json (+ legal.json).
 *
 * NOTE: this is the *client* layer. Crawlers/social scrapers that don't run JS
 * read the *static* HTML, produced per route + language by scripts/prerender.mjs
 * from the same seo.json — the two must stay consistent.
 */

export type Lang = "es" | "en";

export interface HeadMeta {
  title: string;
  description: string;
  canonical: string;
  image?: string | null;
  noindex?: boolean;
  alternates?: { hreflang: string; href: string }[];
}

const SITE = (seoData.siteUrl ?? "https://pacific-code-labs.jcampos.dev").replace(/\/$/, "");

function pick(obj: { es?: string; en?: string } | undefined, lang: Lang): string {
  return (obj?.[lang] ?? obj?.es ?? "") as string;
}

/** Slug (no language prefix) from any path: "" (home) | "products" | "privacy". */
function slugOf(path: string): string {
  const parts = path.replace(/^\/+/, "").replace(/\/+$/, "").split("/").filter(Boolean);
  if (parts.length && isLang(parts[0])) parts.shift();
  return parts[0] ?? "";
}

/** Resolve title/description/canonical/image/hreflang for a route + language. */
export function resolveSeo(path: string, lang: Lang): HeadMeta {
  const slug = slugOf(path);
  const image = seoData.ogImageUrl ?? `${SITE}/opengraph.jpg`;
  const canonical = SITE + localizedPath(lang, slug);

  // Per-language alternates + x-default (default language).
  const alternates = [
    ...LANGUAGES.map((l) => ({ hreflang: l, href: SITE + localizedPath(l, slug) })),
    { hreflang: "x-default", href: SITE + localizedPath(getDefaultLang(), slug) },
  ];

  let title: string;
  let description: string;

  if (slug === "privacy" || slug === "terms") {
    const entry = (legalData as Record<string, typeof legalData.privacy>)[slug];
    const tr = entry?.translations?.[lang] ?? entry?.translations?.es;
    title = `${tr?.title ?? "Legal"} — Pacific Code Labs`;
    description = pick(seoData.siteDescription, lang);
  } else {
    const pages = seoData.pages as Record<string, { title?: { es?: string; en?: string }; description?: { es?: string; en?: string } }>;
    const page = slug ? pages?.[`/${slug}`] : undefined;
    title = page ? pick(page.title, lang) : pick(seoData.siteTitle, lang);
    description = page ? pick(page.description, lang) : pick(seoData.siteDescription, lang);
  }

  return { title, description, canonical, image, alternates };
}

function upsertMeta(attr: "name" | "property", key: string, content: string | null | undefined) {
  const el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!content) {
    el?.remove();
    return;
  }
  if (el) {
    el.setAttribute("content", content);
  } else {
    const m = document.createElement("meta");
    m.setAttribute(attr, key);
    m.setAttribute("content", content);
    document.head.appendChild(m);
  }
}

function upsertCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

function setAlternates(alts: { hreflang: string; href: string }[]) {
  document.head.querySelectorAll('link[rel="alternate"][hreflang]').forEach((el) => el.remove());
  for (const a of alts) {
    const el = document.createElement("link");
    el.setAttribute("rel", "alternate");
    el.setAttribute("hreflang", a.hreflang);
    el.setAttribute("href", a.href);
    document.head.appendChild(el);
  }
}

/** Imperatively apply head tags. Re-runs whenever the inputs change. */
export function useHeadTags(meta: HeadMeta, lang: Lang) {
  const altsKey = (meta.alternates ?? []).map((a) => `${a.hreflang}:${a.href}`).join("|");
  useEffect(() => {
    document.title = meta.title;
    document.documentElement.lang = lang;
    upsertMeta("name", "description", meta.description);
    upsertMeta("name", "robots", meta.noindex ? "noindex, follow" : "index, follow, max-image-preview:large");
    upsertCanonical(meta.canonical);
    upsertMeta("property", "og:title", meta.title);
    upsertMeta("property", "og:description", meta.description);
    upsertMeta("property", "og:url", meta.canonical);
    upsertMeta("property", "og:locale", lang === "es" ? "es_CR" : "en_US");
    upsertMeta("property", "og:image", meta.image);
    upsertMeta("name", "twitter:title", meta.title);
    upsertMeta("name", "twitter:description", meta.description);
    upsertMeta("name", "twitter:image", meta.image);
    if (meta.alternates) setAlternates(meta.alternates);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meta.title, meta.description, meta.canonical, meta.image, meta.noindex, lang, altsKey]);
}
