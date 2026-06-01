import { useState } from "react";
import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/admin/PageHeader";
import { LangToggle, TextField, TextAreaField } from "@/components/admin/AdminUI";
import { useAdminStore, downloadJson } from "@/lib/admin-store";
import { useAdminLang } from "@/lib/admin-lang";

export function SeoPage() {
  const { t } = useTranslation();
  const { seo, setSeo } = useAdminStore();
  const { lang } = useAdminLang();
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

      <div className="space-y-4 max-w-2xl">
        <LangToggle />

        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 space-y-5">
          <TextField
            label="Título del sitio"
            value={form.siteTitle?.[lang] ?? ""}
            onChange={(v) => setForm({ ...form, siteTitle: { ...form.siteTitle, [lang]: v } })}
          />
          <TextAreaField
            label="Descripción"
            value={form.siteDescription?.[lang] ?? ""}
            onChange={(v) => setForm({ ...form, siteDescription: { ...form.siteDescription, [lang]: v } })}
            rows={3}
          />
          <TextField label="OG Image URL" type="url" value={form.ogImageUrl ?? ""} onChange={(v) => setForm({ ...form, ogImageUrl: v || null })} placeholder="https://..." />
          <div className="grid grid-cols-2 gap-4">
            <TextField label="Twitter Handle" value={form.twitterHandle ?? ""} onChange={(v) => setForm({ ...form, twitterHandle: v || null })} placeholder="@handle" />
            <TextField label="Google Analytics ID" value={form.googleAnalyticsId ?? ""} onChange={(v) => setForm({ ...form, googleAnalyticsId: v || null })} placeholder="G-XXXXXXXXXX" />
          </div>
        </div>
      </div>
    </div>
  );
}
