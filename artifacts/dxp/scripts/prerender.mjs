// Post-build pre-rendering for the GitHub Pages SPA. Runs after `vite build`.
//
// Every route serves the SAME built index.html, so JS-injected meta is invisible
// to crawlers/scrapers that don't run JavaScript (most social + AI bots). This
// writes a STATIC HTML file per LANGUAGE-prefixed route — dist/public/<lang>/
// <slug>/index.html — each with its own <title>, description, canonical,
// hreflang alternates, Open Graph / Twitter tags and JSON-LD, from the same
// src/content/seo.json the runtime uses. Also emits the root redirect, a noindex
// 404.html SPA fallback, and a hreflang sitemap.xml.

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist", "public");
const CONTENT = path.join(ROOT, "src", "content");

const LANGS = ["es", "en"];
const DEFAULT_LANG = "es";

const readJson = async (p) => JSON.parse(await fs.readFile(p, "utf8"));
const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
const lp = (lang, slug) => (slug ? `/${lang}/${slug}` : `/${lang}`);

async function main() {
  const seo = await readJson(path.join(CONTENT, "seo.json"));
  const legal = await readJson(path.join(CONTENT, "legal.json"));
  const faq = await readJson(path.join(CONTENT, "faq.json"));

  const SITE = (seo.siteUrl ?? "https://pacific-code-labs.jcampos.dev").replace(/\/$/, "");
  const IMAGE = seo.ogImageUrl ?? `${SITE}/opengraph.jpg`;
  const template = await fs.readFile(path.join(DIST, "index.html"), "utf8");

  // Route descriptors (language-agnostic). title/description are resolvers.
  const routes = [
    {
      slug: "",
      faq: true,
      title: (l) => seo.siteTitle?.[l] ?? seo.siteTitle?.es,
      description: (l) => seo.siteDescription?.[l] ?? seo.siteDescription?.es,
    },
    ...Object.entries(seo.pages ?? {}).map(([p, v]) => ({
      slug: p.replace(/^\//, ""),
      faq: p === "/contact",
      title: (l) => v.title?.[l] ?? v.title?.es,
      description: (l) => v.description?.[l] ?? v.description?.es,
    })),
    ...["privacy", "terms"].map((k) => ({
      slug: k,
      title: (l) => `${(legal[k]?.translations?.[l] ?? legal[k]?.translations?.es)?.title ?? "Legal"} — Pacific Code Labs`,
      description: (l) => seo.siteDescription?.[l] ?? seo.siteDescription?.es,
    })),
  ];

  const faqEntries = faq
    .filter((f) => f.status === "active")
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const replaceTag = (html, re, replacement) => (re.test(html) ? html.replace(re, replacement) : html);

  const render = ({ lang, slug, title, description, faq: withFaq, canonical, noindex = false }) => {
    const t = esc(title);
    const d = esc(description);
    let html = template;

    html = replaceTag(html, /<html lang="[^"]*">/, `<html lang="${lang}">`);
    html = replaceTag(html, /<title>[\s\S]*?<\/title>/, `<title>${t}</title>`);
    html = replaceTag(html, /<meta name="description"[^>]*>/, `<meta name="description" content="${d}" />`);
    html = replaceTag(
      html,
      /<meta name="robots"[^>]*>/,
      `<meta name="robots" content="${noindex ? "noindex, follow" : "index, follow, max-image-preview:large"}" />`,
    );
    html = replaceTag(html, /<link rel="canonical"[^>]*>/, `<link rel="canonical" href="${canonical}" />`);
    html = replaceTag(html, /<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${t}" />`);
    html = replaceTag(html, /<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${d}" />`);
    html = replaceTag(html, /<meta property="og:url"[^>]*>/, `<meta property="og:url" content="${canonical}" />`);
    html = replaceTag(html, /<meta property="og:locale"[^>]*>/, `<meta property="og:locale" content="${lang === "es" ? "es_CR" : "en_US"}" />`);
    html = replaceTag(
      html,
      /<meta property="og:locale:alternate"[^>]*>/,
      `<meta property="og:locale:alternate" content="${lang === "es" ? "en_US" : "es_CR"}" />`,
    );
    html = replaceTag(html, /<meta name="twitter:title"[^>]*>/, `<meta name="twitter:title" content="${t}" />`);
    html = replaceTag(html, /<meta name="twitter:description"[^>]*>/, `<meta name="twitter:description" content="${d}" />`);

    // hreflang alternates for this slug.
    const alternates = [
      ...LANGS.map((l) => ({ hreflang: l, href: SITE + lp(l, slug) })),
      { hreflang: "x-default", href: SITE + lp(DEFAULT_LANG, slug) },
    ];
    const hreflangTags = alternates
      .map((a) => `<link rel="alternate" hreflang="${a.hreflang}" href="${a.href}" />`)
      .join("\n    ");

    // Structured data: WebPage + breadcrumb (+ FAQ where relevant).
    const graph = [
      {
        "@type": "WebPage",
        "@id": `${canonical}#webpage`,
        url: canonical,
        name: title,
        description,
        isPartOf: { "@id": `${SITE}/#website` },
        inLanguage: lang,
      },
    ];
    if (slug) {
      graph.push({
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: lang === "es" ? "Inicio" : "Home", item: SITE + lp(lang, "") },
          { "@type": "ListItem", position: 2, name: title, item: canonical },
        ],
      });
    }
    const blocks = [{ "@context": "https://schema.org", "@graph": graph }];
    if (withFaq && faqEntries.length) {
      blocks.push({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqEntries.map((f) => {
          const tr = f.translations[lang] ?? f.translations.es;
          return { "@type": "Question", name: tr.question, acceptedAnswer: { "@type": "Answer", text: tr.answer } };
        }),
      });
    }
    const ld = blocks.map((b) => `<script type="application/ld+json">${JSON.stringify(b)}</script>`).join("\n    ");

    return html.replace("</head>", `    ${hreflangTags}\n    ${ld}\n  </head>`);
  };

  let count = 0;
  const sitemapUrls = [];
  for (const lang of LANGS) {
    for (const route of routes) {
      const canonical = SITE + lp(lang, route.slug);
      const html = render({
        lang,
        slug: route.slug,
        title: route.title(lang),
        description: route.description(lang),
        faq: route.faq,
        canonical,
      });
      const dir = path.join(DIST, lang, route.slug);
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(path.join(dir, "index.html"), html, "utf8");
      count++;
      sitemapUrls.push({ slug: route.slug, lang });
    }
  }

  // Root → canonical to the default-language home (the app also redirects).
  const rootHtml = render({
    lang: DEFAULT_LANG,
    slug: "",
    title: seo.siteTitle?.[DEFAULT_LANG],
    description: seo.siteDescription?.[DEFAULT_LANG],
    faq: true,
    canonical: SITE + lp(DEFAULT_LANG, ""),
  });
  await fs.writeFile(path.join(DIST, "index.html"), rootHtml, "utf8");

  // noindex SPA fallback for unknown paths.
  const fallback = render({
    lang: DEFAULT_LANG,
    slug: "",
    title: seo.siteTitle?.[DEFAULT_LANG],
    description: seo.siteDescription?.[DEFAULT_LANG],
    canonical: SITE + lp(DEFAULT_LANG, ""),
    noindex: true,
  });
  await fs.writeFile(path.join(DIST, "404.html"), fallback, "utf8");

  // Sitemap with hreflang alternates (one <url> per lang+slug).
  const uniqueSlugs = [...new Set(sitemapUrls.map((u) => u.slug))];
  const entries = [];
  for (const lang of LANGS) {
    for (const slug of uniqueSlugs) {
      const loc = SITE + lp(lang, slug);
      const links = [
        ...LANGS.map((l) => `      <xhtml:link rel="alternate" hreflang="${l}" href="${SITE + lp(l, slug)}" />`),
        `      <xhtml:link rel="alternate" hreflang="x-default" href="${SITE + lp(DEFAULT_LANG, slug)}" />`,
      ].join("\n");
      entries.push(
        `  <url>\n    <loc>${loc}</loc>\n${links}\n    <changefreq>monthly</changefreq>\n  </url>`,
      );
    }
  }
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${entries.join("\n")}\n</urlset>\n`;
  await fs.writeFile(path.join(DIST, "sitemap.xml"), sitemap, "utf8");

  console.log(`prerender: ${count} lang routes + root + 404.html + sitemap.xml -> ${path.relative(process.cwd(), DIST)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
