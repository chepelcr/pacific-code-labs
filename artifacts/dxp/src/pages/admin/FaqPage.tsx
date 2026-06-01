import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { useAdminStore, downloadJson } from "@/lib/admin-store";

export function FaqPage() {
  const { t } = useTranslation();
  const { faq, setFaq } = useAdminStore();
  const [editing, setEditing] = useState<string | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});

  const handleEdit = (id: string) => {
    const f = faq.find((x) => x.id === id);
    if (!f) return;
    setForm({
      question_es: f.translations.es?.question ?? "",
      answer_es: f.translations.es?.answer ?? "",
      question_en: f.translations.en?.question ?? "",
      answer_en: f.translations.en?.answer ?? "",
      status: f.status,
    });
    setIsNew(false);
    setEditing(id);
  };

  const handleNew = () => {
    setForm({ question_es: "", answer_es: "", question_en: "", answer_en: "", status: "draft" });
    setIsNew(true);
    setEditing("new");
  };

  const handleSave = () => {
    if (isNew) {
      const newEntry = {
        id: `faq-${Date.now()}`,
        status: form.status as "active" | "draft" | "archived",
        sortOrder: faq.length + 1,
        translations: {
          es: { question: form.question_es, answer: form.answer_es },
          en: { question: form.question_en, answer: form.answer_en },
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setFaq([...faq, newEntry] as typeof faq);
    } else if (editing) {
      const updated = faq.map((f) =>
        f.id === editing
          ? { ...f, status: form.status as "active" | "draft" | "archived",
              translations: {
                ...f.translations,
                es: { question: form.question_es, answer: form.answer_es },
                en: { question: form.question_en, answer: form.answer_en },
              }, updatedAt: new Date().toISOString() }
          : f
      );
      setFaq(updated as typeof faq);
    }
    setEditing(null);
    setIsNew(false);
  };

  const handleDelete = (id: string) => {
    if (!confirm("¿Eliminar esta entrada?")) return;
    setFaq(faq.filter((f) => f.id !== id));
  };

  return (
    <div data-testid="faq-page">
      <PageHeader
        title={t("admin.faq")}
        description="Gestiona las preguntas frecuentes."
        onExport={() => downloadJson("faq.json", faq)}
        action={
          <button onClick={handleNew} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#2563EB] text-white text-sm font-medium hover:bg-[#1d4ed8] transition-colors" data-testid="btn-add-faq">
            <Plus className="w-4 h-4" />
            {t("admin.add")}
          </button>
        }
      />

      <div className="space-y-3">
        {faq.map((f, i) => (
          <div key={f.id} className="bg-white rounded-xl border border-[#E2E8F0] p-5 flex items-start gap-4" data-testid={`faq-admin-item-${f.id}`}>
            <div className="text-xs font-bold text-[#94A3B8] w-6 flex-shrink-0 pt-1">{i + 1}</div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-[#0F172A] text-sm">{f.translations.es?.question}</p>
              <p className="text-[#64748B] text-xs mt-1 line-clamp-2">{f.translations.es?.answer}</p>
            </div>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${
              f.status === "active" ? "bg-[#DCFCE7] text-[#16A34A]" : "bg-[#F1F5F9] text-[#64748B]"
            }`}>{f.status}</span>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={() => handleEdit(f.id)} className="text-[#94A3B8] hover:text-[#2563EB]"><Edit2 className="w-4 h-4" /></button>
              <button onClick={() => handleDelete(f.id)} className="text-[#94A3B8] hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-[#0F172A] mb-6">{isNew ? "Nueva Pregunta" : "Editar Pregunta"}</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#64748B] mb-1">Pregunta (ES)</label>
                  <input value={form.question_es} onChange={(e) => setForm({...form, question_es: e.target.value})} className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#2563EB]" data-testid="input-faq-question-es" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#64748B] mb-1">Question (EN)</label>
                  <input value={form.question_en} onChange={(e) => setForm({...form, question_en: e.target.value})} className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#2563EB]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#64748B] mb-1">Respuesta (ES)</label>
                  <textarea value={form.answer_es} onChange={(e) => setForm({...form, answer_es: e.target.value})} rows={4} className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#2563EB] resize-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#64748B] mb-1">Answer (EN)</label>
                  <textarea value={form.answer_en} onChange={(e) => setForm({...form, answer_en: e.target.value})} rows={4} className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#2563EB] resize-none" />
                </div>
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
            <div className="flex gap-3 mt-6">
              <button onClick={handleSave} className="flex-1 px-4 py-2.5 rounded-xl bg-[#2563EB] text-white font-semibold text-sm hover:bg-[#1d4ed8]" data-testid="btn-save-faq">{t("admin.save")}</button>
              <button onClick={() => setEditing(null)} className="px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-[#64748B] font-semibold text-sm">{t("admin.cancel")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
