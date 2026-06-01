import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { LangToggle, TextField, TextAreaField } from "@/components/admin/AdminUI";
import { useAdminStore, downloadJson } from "@/lib/admin-store";
import { useAdminLang } from "@/lib/admin-lang";
import { RICH_TEXT_HINT } from "@/lib/rich-text";

const selectCls =
  "w-full h-10 rounded-xl border border-[#E2E8F0] bg-white px-3 text-sm focus:outline-none focus:border-[#2563EB]";

export function CaseStudiesPage() {
  const { t } = useTranslation();
  const { caseStudies, setCaseStudies } = useAdminStore();
  const { lang } = useAdminLang();
  const [editing, setEditing] = useState<string | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const persist = async () => {
    setSaving(true);
    await downloadJson("caseStudies.json", caseStudies);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleEdit = (id: string) => {
    const cs = caseStudies.find((x) => x.id === id);
    if (!cs) return;
    const tr = cs.translations[lang];
    setForm({
      title: tr?.title ?? "",
      summary: tr?.summary ?? "",
      challenge: tr?.challenge ?? "",
      solution: tr?.solution ?? "",
      result: tr?.result ?? "",
      industry: cs.industry ?? "",
      status: cs.status,
    });
    setIsNew(false);
    setEditing(id);
  };

  const handleNew = () => {
    setForm({ title: "", summary: "", challenge: "", solution: "", result: "", industry: "", status: "draft" });
    setIsNew(true);
    setEditing("new");
  };

  const handleApply = () => {
    const tr = { title: form.title, summary: form.summary, challenge: form.challenge, solution: form.solution, result: form.result };
    const empty = { title: "", summary: "", challenge: "", solution: "", result: "" };
    if (isNew) {
      const id = `case-${Date.now()}`;
      setCaseStudies([
        ...caseStudies,
        {
          id,
          slug: id,
          status: form.status as "active" | "draft" | "archived",
          sortOrder: caseStudies.length + 1,
          imageUrl: null,
          industry: form.industry || null,
          translations: { es: lang === "es" ? tr : empty, en: lang === "en" ? tr : empty },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ] as typeof caseStudies);
    } else if (editing) {
      setCaseStudies(
        caseStudies.map((cs) =>
          cs.id === editing
            ? {
                ...cs,
                status: form.status as "active" | "draft" | "archived",
                industry: form.industry || null,
                translations: { ...cs.translations, [lang]: tr },
                updatedAt: new Date().toISOString(),
              }
            : cs,
        ) as typeof caseStudies,
      );
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
        description="Gestiona los casos de éxito. Guarda para escribir caseStudies.json."
        onSave={persist}
        saving={saving}
        saved={saved}
        action={
          <button onClick={handleNew} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#E2E8F0] bg-white text-[#0F172A] text-sm font-medium hover:border-[#CBD5E1]" data-testid="btn-add-case-study">
            <Plus className="w-4 h-4" />
            {t("admin.add")}
          </button>
        }
      />

      <div className="space-y-4">
        <LangToggle />

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
                  <td className="px-6 py-4 font-medium text-[#0F172A]">{cs.translations[lang]?.title}</td>
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
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-[#0F172A]">{isNew ? "Nuevo Caso" : "Editar Caso"}</h2>
              <span className="text-xs font-semibold uppercase tracking-widest text-[#94A3B8]">{lang === "es" ? "Español" : "English"}</span>
            </div>
            <div className="space-y-3">
              <TextField label="Título" value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
              <TextAreaField label="Resumen" value={form.summary} onChange={(v) => setForm({ ...form, summary: v })} rows={2} />
              <TextAreaField label="Desafío" value={form.challenge} onChange={(v) => setForm({ ...form, challenge: v })} rows={3} hint={RICH_TEXT_HINT} />
              <TextAreaField label="Solución" value={form.solution} onChange={(v) => setForm({ ...form, solution: v })} rows={3} />
              <TextAreaField label="Resultado" value={form.result} onChange={(v) => setForm({ ...form, result: v })} rows={2} />
              <div className="grid grid-cols-2 gap-3">
                <TextField label="Industria" value={form.industry} onChange={(v) => setForm({ ...form, industry: v })} />
                <div>
                  <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">Estado</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={selectCls}>
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={handleApply} className="flex-1 px-4 py-2.5 rounded-xl bg-[#2563EB] text-white font-semibold text-sm hover:bg-[#1d4ed8]">{t("admin.save")}</button>
              <button onClick={() => setEditing(null)} className="px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-[#64748B] font-semibold text-sm">{t("admin.cancel")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
