import { useTranslation } from "react-i18next";
import { Download } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { useAdminStore, downloadJson } from "@/lib/admin-store";

export function ContentVersionsPage() {
  const { t } = useTranslation();
  const store = useAdminStore();

  const files = [
    { name: "hero.json", data: store.hero, description: "Hero section content" },
    { name: "about.json", data: store.about, description: "About section content" },
    { name: "products.json", data: store.products, description: `${store.products.length} products` },
    { name: "services.json", data: store.services, description: `${store.services.length} services` },
    { name: "caseStudies.json", data: store.caseStudies, description: `${store.caseStudies.length} case studies` },
    { name: "faq.json", data: store.faq, description: `${store.faq.length} FAQ entries` },
    { name: "philosophy.json", data: store.philosophy, description: "Philosophy section" },
    { name: "navigation.json", data: store.navigation, description: "Navigation links" },
    { name: "footer.json", data: store.footer, description: "Footer content" },
    { name: "legal.json", data: store.legal, description: "Privacy & Terms pages" },
    { name: "seo.json", data: store.seo, description: "SEO settings" },
    { name: "languages.json", data: store.languages, description: `${store.languages.length} languages` },
    { name: "themes.json", data: store.themes, description: `${store.themes.length} themes` },
    { name: "branding.json", data: store.branding, description: "Logo, favicon, name & tagline" },
    { name: "media.json", data: store.media, description: `${store.media.items.length} media assets` },
    { name: "settings.json", data: store.settings, description: "Site & auto-translate settings" },
    { name: "inventory.json", data: store.inventory, description: `${store.inventory.counts.nodes} modules, ${store.inventory.counts.edges} links` },
  ];

  const exportAll = () => {
    files.forEach(({ name, data }) => {
      setTimeout(() => downloadJson(name, data), 100);
    });
  };

  return (
    <div data-testid="content-versions-page">
      <PageHeader
        title={t("admin.contentVersions")}
        description="Exporta el contenido como archivos JSON para guardar en el repositorio."
        action={
          <button
            onClick={exportAll}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#0F172A] text-white text-sm font-medium hover:bg-[#1e293b] transition-colors"
            data-testid="btn-export-all"
          >
            <Download className="w-4 h-4" />
            {t("admin.exportAll")}
          </button>
        }
      />

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-background">
              <th className="text-left px-6 py-3 font-semibold text-muted-foreground">Archivo</th>
              <th className="text-left px-6 py-3 font-semibold text-muted-foreground hidden md:table-cell">Descripción</th>
              <th className="text-right px-6 py-3 font-semibold text-muted-foreground">Descargar</th>
            </tr>
          </thead>
          <tbody>
            {files.map((f) => (
              <tr key={f.name} className="border-b border-border last:border-0 hover:bg-muted" data-testid={`content-file-${f.name}`}>
                <td className="px-6 py-4">
                  <code className="text-primary font-mono text-xs bg-primary/10 px-2 py-1 rounded">{f.name}</code>
                </td>
                <td className="px-6 py-4 text-muted-foreground hidden md:table-cell">{f.description}</td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => downloadJson(f.name, f.data)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-input text-xs font-medium transition-colors ml-auto"
                    data-testid={`download-${f.name}`}
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
