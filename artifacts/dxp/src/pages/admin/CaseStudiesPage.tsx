import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { useAdminStore, downloadJson } from "@/lib/admin-store";

export function CaseStudiesPage() {
  const { t } = useTranslation();
  const { caseStudies, setCaseStudies } = useAdminStore();
  const [editing, setEditing] = useState<string | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});

  const handleEdit = (id: string) => {
    const cs = caseStudies.find((x) => x.id === id);
    if (!cs) return;
    setForm({
      title_es: cs.translations.es?.title ?? "",
      summary_es: cs.translations.es?.summary ?? "",
      title_en: cs.translations.en?.title ?? "",
      summary_en: cs.translations.en?.summary ?? "",
      industry: cs.industry ?? "",
      status: cs.status,
    });
    setIsNew(false);
    setEditing(id);
  };

  const handleNew = () => {
    setForm({ title_es: "", summary_es: "", title_en: "", summary_en: "", industry: "", status: "draft" });
    setIsNew(true);
    setEditing("new");
  };

  const handleSave = () => {
    if (isNew) {
      const entry = {
        id: `case-${Date.now()}`,
        slug: `case-${Date.now()}`,
        status: form.status as "active" | "draft" | "archived",
        sortOrder: caseStudies.length + 1,
        imageUrl: null,
        industry: form.industry || null,
        translations: {
          es: { title: form.title_es, summary: form.summary_es, challenge: "", solution: "", result: "" },
          en: { title: form.title_en, summary: form.summary_en, challenge: "", solution: "", result: "" },
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setCaseStudies([...caseStudies, entry] as typeof caseStudies);
    } else if (editing) {
      const updated = caseStudies.map((cs) =>
        cs.id === editing
          ? { ...cs, status: form.status as "active" | "draft" | "archived", industry: form.industry || null,
              translations: { ...cs.translations,
                es: { ...cs.translations.es, title: form.title_es, summary: form.summary_es },
                en: { ...cs.translations.en, title: form.title_en, summary: form.summary_en },
              }, updatedAt: new Date().toISOString() }
          : cs
      );
      setCaseStudies(updated as typeof caseStudies);
    }
    setEditing(null);
  };

  const handleDelete = (id: string) => {
    if (!confirm("¿Eliminar este caso?")) return;
    setCaseStudies(caseStudies.filter((cs) => cs.id !== id));
  };

  return (
    <div data-testid="case-studies-page">
      <PageHeader
        title={t("admin.caseStudies")}
        description="Gestiona los casos de éxito."
        onExport={() => downloadJson("caseStudies.json", caseStudies)}
        action={
          <button onClick={handleNew} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#2563EB] text-white text-sm font-medium hover:bg-[#1d4ed8]" data-testid="btn-add-case-study">
            <Plus className="w-4 h-4" />
            {t("admin.add")}
          </button>
        }
      />

      <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
              <th className="text-left px-6 py-3 font-semibold text-[#64748B]">Título</th>
              <th className="text-left px-6 py-3 font-semibold text-[#64748B] hidden md:table-cell">Industria</th>
              <th className="text-left px-6 py-3 font-semibold text-[#64748B]">Estado</th>
              <th className="text-right px-6 py-3 font-semibold text-[#64748B]">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {caseStudies.map((cs) => (
              <tr key={cs.id} className="border-b border-[#F1F5F9] last:border-0 hover:bg-[#F8FAFC]" data-testid={`case-study-row-${cs.id}`}>
                <td className="px-6 py-4 font-medium text-[#0F172A]">{cs.translations.es?.title}</td>
                <td className="px-6 py-4 text-[#64748B] hidden md:table-cell">{cs.industry ?? "—"}</td>
                <td className="px-6 py-4">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    cs.status === "active" ? "bg-[#DCFCE7] text-[#16A34A]" : "bg-[#F1F5F9] text-[#64748B]"
                  }`}>{cs.status}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => handleEdit(cs.id)} className="text-[#94A3B8] hover:text-[#2563EB]"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(cs.id)} className="text-[#94A3B8] hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-[#0F172A] mb-5">{isNew ? "Nuevo Caso" : "Editar Caso"}</h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#64748B] mb-1">Título (ES)</label>
                  <input value={form.title_es} onChange={(e) => setForm({...form, title_es: e.target.value})} className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#2563EB]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#64748B] mb-1">Title (EN)</label>
                  <input value={form.title_en} onChange={(e) => setForm({...form, title_en: e.target.value})} className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#2563EB]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#64748B] mb-1">Resumen (ES)</label>
                  <textarea value={form.summary_es} onChange={(e) => setForm({...form, summary_es: e.target.value})} rows={2} className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#2563EB] resize-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#64748B] mb-1">Summary (EN)</label>
                  <textarea value={form.summary_en} onChange={(e) => setForm({...form, summary_en: e.target.value})} rows={2} className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#2563EB] resize-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#64748B] mb-1">Industria</label>
                  <input value={form.industry} onChange={(e) => setForm({...form, industry: e.target.value})} className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#2563EB]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#64748B] mb-1">Estado</label>
                  <select value={form.status} onChange={(e) => setForm({...form, status: e.target.value})} className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#2563EB] bg-white">
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={handleSave} className="flex-1 px-4 py-2.5 rounded-xl bg-[#2563EB] text-white font-semibold text-sm hover:bg-[#1d4ed8]">{t("admin.save")}</button>
              <button onClick={() => setEditing(null)} className="px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-[#64748B] font-semibold text-sm">{t("admin.cancel")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
