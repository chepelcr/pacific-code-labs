import { useState } from "react";
import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/admin/PageHeader";
import { useAdminStore, downloadJson } from "@/lib/admin-store";

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
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSeo(form as unknown as typeof seo);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div data-testid="seo-page">
      <PageHeader
        title={t("admin.seo")}
        description="Configuración de metadatos y SEO global."
        onExport={() => downloadJson("seo.json", seo)}
      />

      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 max-w-2xl space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#64748B] mb-1.5">Título del sitio (ES)</label>
            <input
              value={form.siteTitle?.es ?? ""}
              onChange={(e) => setForm({...form, siteTitle: {...form.siteTitle, es: e.target.value}})}
              className="w-full px-3 py-2.5 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#2563EB]"
              data-testid="input-seo-title-es"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#64748B] mb-1.5">Site title (EN)</label>
            <input
              value={form.siteTitle?.en ?? ""}
              onChange={(e) => setForm({...form, siteTitle: {...form.siteTitle, en: e.target.value}})}
              className="w-full px-3 py-2.5 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#2563EB]"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#64748B] mb-1.5">Descripción (ES)</label>
            <textarea
              value={form.siteDescription?.es ?? ""}
              onChange={(e) => setForm({...form, siteDescription: {...form.siteDescription, es: e.target.value}})}
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#2563EB] resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#64748B] mb-1.5">Description (EN)</label>
            <textarea
              value={form.siteDescription?.en ?? ""}
              onChange={(e) => setForm({...form, siteDescription: {...form.siteDescription, en: e.target.value}})}
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#2563EB] resize-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#64748B] mb-1.5">OG Image URL</label>
          <input
            value={form.ogImageUrl ?? ""}
            onChange={(e) => setForm({...form, ogImageUrl: e.target.value || null})}
            placeholder="https://..."
            className="w-full px-3 py-2.5 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#2563EB]"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#64748B] mb-1.5">Twitter Handle</label>
            <input
              value={form.twitterHandle ?? ""}
              onChange={(e) => setForm({...form, twitterHandle: e.target.value || null})}
              placeholder="@handle"
              className="w-full px-3 py-2.5 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#2563EB]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#64748B] mb-1.5">Google Analytics ID</label>
            <input
              value={form.googleAnalyticsId ?? ""}
              onChange={(e) => setForm({...form, googleAnalyticsId: e.target.value || null})}
              placeholder="G-XXXXXXXXXX"
              className="w-full px-3 py-2.5 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#2563EB]"
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors ${
            saved ? "bg-[#10B981] text-white" : "bg-[#2563EB] text-white hover:bg-[#1d4ed8]"
          }`}
          data-testid="btn-save-seo"
        >
          {saved ? "Guardado" : t("admin.save")}
        </button>
      </div>
    </div>
  );
}
