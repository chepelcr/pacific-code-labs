import { useState } from "react";
import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/admin/PageHeader";
import { TextField, BilingualField, BilingualTextArea, BilingualSection, AdminCard } from "@/components/admin/AdminUI";
import { useAdminStore, downloadJson } from "@/lib/admin-store";
import type { Lang } from "@/lib/translate";

export function SeoPage() {
  const { t } = useTranslation();
  const { seo, setSeo } = useAdminStore();
  const [form, setForm] = useState<{
    siteTitle?: { es?: string; en?: string };
    siteDescription?: { es?: string; en?: string };
    ogImageUrl: string | null;
    twitterHandle: string | null;
    googleAnalyticsId: string | null;
  }>({ ...seo });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const persist = async () => {
    setSaving(true);
    setSeo(form as unknown as typeof seo);
    await downloadJson("seo.json", form);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div data-testid="seo-page">
      <PageHeader
        title={t("admin.seo")}
        description="Metadatos y SEO global. Guarda para escribir seo.json."
        onSave={persist}
        saving={saving}
        saved={saved}
      />

      <div className="space-y-4">
        <BilingualSection>
          <BilingualField
            label="Título del sitio"
            es={form.siteTitle?.es ?? ""}
            en={form.siteTitle?.en ?? ""}
            onChange={(l: Lang, v) => setForm({ ...form, siteTitle: { ...form.siteTitle, [l]: v } })}
          />
          <BilingualTextArea
            label="Descripción"
            es={form.siteDescription?.es ?? ""}
            en={form.siteDescription?.en ?? ""}
            onChange={(l: Lang, v) => setForm({ ...form, siteDescription: { ...form.siteDescription, [l]: v } })}
            rows={3}
          />
        </BilingualSection>

        <AdminCard title="Metadatos">
          <TextField label="OG Image URL" type="url" value={form.ogImageUrl ?? ""} onChange={(v) => setForm({ ...form, ogImageUrl: v || null })} placeholder="https://..." />
          <div className="grid grid-cols-2 gap-4">
            <TextField label="Twitter Handle" value={form.twitterHandle ?? ""} onChange={(v) => setForm({ ...form, twitterHandle: v || null })} placeholder="@handle" />
            <TextField label="Google Analytics ID" value={form.googleAnalyticsId ?? ""} onChange={(v) => setForm({ ...form, googleAnalyticsId: v || null })} placeholder="G-XXXXXXXXXX" />
          </div>
        </AdminCard>
      </div>
    </div>
  );
}
