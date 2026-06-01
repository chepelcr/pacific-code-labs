import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Globe, Check, X } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { useAdminStore, downloadJson } from "@/lib/admin-store";

export function LanguagesPage() {
  const { t } = useTranslation();
  const { languages, setLanguages } = useAdminStore();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const toggleActive = (code: string) => {
    setLanguages(languages.map((l) => l.code === code ? { ...l, isActive: !l.isActive } : l) as typeof languages);
  };

  const persist = async () => {
    setSaving(true);
    await downloadJson("languages.json", languages);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div data-testid="languages-page">
      <PageHeader
        title={t("admin.languages")}
        description="Idiomas soportados. Guarda para escribir languages.json."
        onSave={persist}
        saving={saving}
        saved={saved}
      />

      <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden max-w-xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
              <th className="text-left px-6 py-3 font-semibold text-[#64748B]">Idioma</th>
              <th className="text-left px-6 py-3 font-semibold text-[#64748B]">Código</th>
              <th className="text-left px-6 py-3 font-semibold text-[#64748B]">Por defecto</th>
              <th className="text-left px-6 py-3 font-semibold text-[#64748B]">Activo</th>
            </tr>
          </thead>
          <tbody>
            {languages.map((l) => (
              <tr key={l.code} className="border-b border-[#F1F5F9] last:border-0" data-testid={`language-row-${l.code}`}>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-[#94A3B8]" />
                    <span className="font-medium text-[#0F172A]">{l.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <code className="text-xs bg-[#F1F5F9] px-2 py-1 rounded font-mono">{l.code}</code>
                </td>
                <td className="px-6 py-4">
                  {l.isDefault
                    ? <Check className="w-4 h-4 text-[#10B981]" />
                    : <X className="w-4 h-4 text-[#CBD5E1]" />}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => toggleActive(l.code)}
                    className={`w-10 h-5 rounded-full transition-colors ${l.isActive ? "bg-[#2563EB]" : "bg-[#E2E8F0]"}`}
                    data-testid={`toggle-language-${l.code}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform mx-0.5 ${l.isActive ? "translate-x-5" : ""}`} />
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
