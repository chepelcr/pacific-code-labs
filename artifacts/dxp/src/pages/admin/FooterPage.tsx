import { useState } from "react";
import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/admin/PageHeader";
import { useAdminStore, downloadJson } from "@/lib/admin-store";

export function FooterPage() {
  const { t } = useTranslation();
  const { footer, setFooter } = useAdminStore();
  const [form, setForm] = useState({ copyright_es: footer.copyright?.es ?? "", copyright_en: footer.copyright?.en ?? "" });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setFooter({ ...footer, copyright: { es: form.copyright_es, en: form.copyright_en } });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div data-testid="footer-page">
      <PageHeader
        title={t("admin.footer")}
        description="Edita el contenido del pie de página."
        onExport={() => downloadJson("footer.json", footer)}
      />

      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 max-w-lg space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[#64748B] mb-1.5">Copyright (ES)</label>
          <input
            value={form.copyright_es}
            onChange={(e) => setForm({ ...form, copyright_es: e.target.value })}
            className="w-full px-3 py-2.5 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#2563EB]"
            data-testid="input-footer-copyright-es"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#64748B] mb-1.5">Copyright (EN)</label>
          <input
            value={form.copyright_en}
            onChange={(e) => setForm({ ...form, copyright_en: e.target.value })}
            className="w-full px-3 py-2.5 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#2563EB]"
            data-testid="input-footer-copyright-en"
          />
        </div>
        <button
          onClick={handleSave}
          className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors ${saved ? "bg-[#10B981] text-white" : "bg-[#2563EB] text-white hover:bg-[#1d4ed8]"}`}
          data-testid="btn-save-footer"
        >
          {saved ? "Guardado" : t("admin.save")}
        </button>
      </div>
    </div>
  );
}
