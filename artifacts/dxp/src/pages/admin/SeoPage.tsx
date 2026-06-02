import { useState } from "react";
import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/admin/PageHeader";
import { TextField, BilingualField, BilingualTextArea, BilingualSection, AdminCard } from "@/components/admin/AdminUI";
import { useAdminStore, downloadJson } from "@/lib/admin-store";
import type { Lang } from "@/lib/translate";

interface Bilingual { es: string; en: string }
interface SeoDraft {
  siteUrl: string;
  siteTitle: Bilingual;
  siteDescription: Bilingual;
  ogImageUrl: string | null;
  twitterHandle: string | null;
  googleAnalyticsId: string | null;
  pages: Record<string, { title: Bilingual; description: Bilingual }>;
}

export function SeoPage() {
  const { t } = useTranslation();
  const { seo, setSeo } = useAdminStore();
  const [draft, setDraft] = useState<SeoDraft>(() => structuredClone(seo) as unknown as SeoDraft);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const update = (mut: (d: SeoDraft) => void) =>
    setDraft((prev) => {
      const next = structuredClone(prev);
      mut(next);
      return next;
    });

  const persist = async () => {
    setSaving(true);
    setSeo(draft as unknown as typeof seo);
    await downloadJson("seo.json", draft);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const pages = draft.pages;

  return (
    <div data-testid="seo-page">
      <PageHeader
        title={t("admin.seo")}
        description="Metadatos y SEO por página. Guarda para escribir seo.json (lo usan el render estático y el runtime)."
        onSave={persist}
        saving={saving}
        saved={saved}
        entity="seo.json"
        value={draft}
      />

      <div className="space-y-4">
        <BilingualSection title="Inicio (por defecto)">
          <BilingualField
            label="Título del sitio"
            es={draft.siteTitle?.es ?? ""}
            en={draft.siteTitle?.en ?? ""}
            onChange={(l: Lang, v) => update((d) => { d.siteTitle[l] = v; })}
          />
          <BilingualTextArea
            label="Descripción"
            es={draft.siteDescription?.es ?? ""}
            en={draft.siteDescription?.en ?? ""}
            onChange={(l: Lang, v) => update((d) => { d.siteDescription[l] = v; })}
            rows={3}
          />
        </BilingualSection>

        <AdminCard title="Global">
          <TextField label="URL del sitio (canonical base)" type="url" value={draft.siteUrl ?? ""} onChange={(v) => update((d) => { d.siteUrl = v; })} placeholder="https://pacific-code-labs.jcampos.dev" />
          <TextField label="OG Image URL" type="url" value={draft.ogImageUrl ?? ""} onChange={(v) => update((d) => { d.ogImageUrl = v || null; })} placeholder="https://.../opengraph.jpg" />
          <div className="grid grid-cols-2 gap-4">
            <TextField label="Twitter Handle" value={draft.twitterHandle ?? ""} onChange={(v) => update((d) => { d.twitterHandle = v || null; })} placeholder="@handle" />
            <TextField label="Google Analytics ID" value={draft.googleAnalyticsId ?? ""} onChange={(v) => update((d) => { d.googleAnalyticsId = v || null; })} placeholder="G-XXXXXXXXXX" />
          </div>
        </AdminCard>

        {Object.keys(pages).map((p) => (
          <BilingualSection key={p} title={`Página · ${p}`}>
            <BilingualField
              label="Título (meta)"
              es={pages[p].title.es}
              en={pages[p].title.en}
              onChange={(l: Lang, v) => update((d) => { d.pages[p].title[l] = v; })}
            />
            <BilingualTextArea
              label="Descripción (meta)"
              es={pages[p].description.es}
              en={pages[p].description.en}
              onChange={(l: Lang, v) => update((d) => { d.pages[p].description[l] = v; })}
              rows={2}
            />
          </BilingualSection>
        ))}
      </div>
    </div>
  );
}
