import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { TextField, BilingualField, BilingualTextArea, BilingualSection } from "@/components/admin/AdminUI";
import { useAdminStore, downloadJson } from "@/lib/admin-store";
import type { Lang } from "@/lib/translate";
import { RICH_TEXT_HINT } from "@/lib/rich-text";

const selectCls =
  "w-full h-10 rounded-xl border border-border bg-card px-3 text-sm focus:outline-none focus:border-primary";

const emptyTr = { title: "", summary: "", challenge: "", solution: "", result: "" };

interface CaseForm {
  es: typeof emptyTr;
  en: typeof emptyTr;
  industry: string;
  status: string;
}

export function CaseStudiesPage() {
  const { t } = useTranslation();
  const { caseStudies, setCaseStudies } = useAdminStore();
  const [editing, setEditing] = useState<string | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [form, setForm] = useState<CaseForm>({ es: { ...emptyTr }, en: { ...emptyTr }, industry: "", status: "draft" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const persist = async () => {
    setSaving(true);
    await downloadJson("caseStudies.json", caseStudies);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const setTr = (lang: Lang, key: keyof typeof emptyTr, value: string) =>
    setForm((f) => ({ ...f, [lang]: { ...f[lang], [key]: value } }));

  const handleEdit = (id: string) => {
    const cs = caseStudies.find((x) => x.id === id);
    if (!cs) return;
    setForm({
      es: { ...emptyTr, ...cs.translations.es },
      en: { ...emptyTr, ...cs.translations.en },
      industry: cs.industry ?? "",
      status: cs.status,
    });
    setIsNew(false);
    setEditing(id);
  };

  const handleNew = () => {
    setForm({ es: { ...emptyTr }, en: { ...emptyTr }, industry: "", status: "draft" });
    setIsNew(true);
    setEditing("new");
  };

  const handleApply = () => {
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
          translations: { es: form.es, en: form.en },
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
                translations: { ...cs.translations, es: form.es, en: form.en },
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
          <button onClick={handleNew} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card text-foreground text-sm font-medium hover:border-input" data-testid="btn-add-case-study">
            <Plus className="w-4 h-4" />
            {t("admin.add")}
          </button>
        }
      />

      <div className="space-y-4">
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-background">
                <th className="text-left px-6 py-3 font-semibold text-muted-foreground">Título</th>
                <th className="text-left px-6 py-3 font-semibold text-muted-foreground hidden md:table-cell">Industria</th>
                <th className="text-left px-6 py-3 font-semibold text-muted-foreground">Estado</th>
                <th className="text-right px-6 py-3 font-semibold text-muted-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {caseStudies.map((cs) => (
                <tr key={cs.id} className="border-b border-border last:border-0 hover:bg-muted" data-testid={`case-study-row-${cs.id}`}>
                  <td className="px-6 py-4 font-medium text-foreground">{cs.translations.es?.title}</td>
                  <td className="px-6 py-4 text-muted-foreground hidden md:table-cell">{cs.industry ?? "—"}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      cs.status === "active" ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400" : "bg-muted text-muted-foreground"
                    }`}>{cs.status}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleEdit(cs.id)} className="text-muted-foreground hover:text-primary"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(cs.id)} className="text-muted-foreground hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
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
          <div className="bg-card rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-foreground mb-6">{isNew ? "Nuevo Caso" : "Editar Caso"}</h2>
            <div className="space-y-4">
              <BilingualSection>
                <BilingualField label="Título" es={form.es.title} en={form.en.title} onChange={(l, v) => setTr(l, "title", v)} />
                <BilingualTextArea label="Resumen" es={form.es.summary} en={form.en.summary} onChange={(l, v) => setTr(l, "summary", v)} rows={2} />
                <BilingualTextArea label="Desafío" es={form.es.challenge} en={form.en.challenge} onChange={(l, v) => setTr(l, "challenge", v)} rows={3} hint={RICH_TEXT_HINT} />
                <BilingualTextArea label="Solución" es={form.es.solution} en={form.en.solution} onChange={(l, v) => setTr(l, "solution", v)} rows={3} />
                <BilingualTextArea label="Resultado" es={form.es.result} en={form.en.result} onChange={(l, v) => setTr(l, "result", v)} rows={2} />
              </BilingualSection>
              <div className="grid grid-cols-2 gap-3 bg-card rounded-2xl border border-border p-6">
                <TextField label="Industria" value={form.industry} onChange={(v) => setForm({ ...form, industry: v })} />
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Estado</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={selectCls}>
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleApply} className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90">{t("admin.save")}</button>
              <button onClick={() => setEditing(null)} className="px-4 py-2.5 rounded-xl border border-border text-muted-foreground font-semibold text-sm">{t("admin.cancel")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
