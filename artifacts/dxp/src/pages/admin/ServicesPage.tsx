import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Edit2, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { useAdminStore, downloadJson } from "@/lib/admin-store";

export function ServicesPage() {
  const { t } = useTranslation();
  const { services, setServices } = useAdminStore();
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});

  const handleEdit = (id: string) => {
    const s = services.find((x) => x.id === id);
    if (!s) return;
    setForm({
      name_es: s.translations.es?.name ?? "",
      description_es: s.translations.es?.description ?? "",
      name_en: s.translations.en?.name ?? "",
      description_en: s.translations.en?.description ?? "",
      iconName: s.iconName ?? "",
      status: s.status,
    });
    setEditing(id);
  };

  const handleSave = () => {
    if (!editing) return;
    const updated = services.map((s) =>
      s.id === editing
        ? {
            ...s,
            status: form.status as "active" | "draft" | "archived",
            iconName: form.iconName || null,
            translations: {
              ...s.translations,
              es: { ...s.translations.es, name: form.name_es, description: form.description_es },
              en: { ...s.translations.en, name: form.name_en, description: form.description_en },
            },
            updatedAt: new Date().toISOString(),
          }
        : s
    );
    setServices(updated as typeof services);
    setEditing(null);
  };

  const handleDelete = (id: string) => {
    if (!confirm("¿Eliminar este servicio?")) return;
    setServices(services.filter((s) => s.id !== id));
  };

  return (
    <div data-testid="services-page">
      <PageHeader
        title={t("admin.services")}
        description="Gestiona los servicios ofrecidos."
        onExport={() => downloadJson("services.json", services)}
      />

      <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
              <th className="text-left px-6 py-3 font-semibold text-[#64748B]">Servicio</th>
              <th className="text-left px-6 py-3 font-semibold text-[#64748B] hidden md:table-cell">Descripción</th>
              <th className="text-left px-6 py-3 font-semibold text-[#64748B]">Estado</th>
              <th className="text-right px-6 py-3 font-semibold text-[#64748B]">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {services.map((s) => (
              <tr key={s.id} className="border-b border-[#F1F5F9] last:border-0 hover:bg-[#F8FAFC]">
                <td className="px-6 py-4 font-medium text-[#0F172A]">{s.translations.es?.name}</td>
                <td className="px-6 py-4 text-[#64748B] hidden md:table-cell max-w-xs truncate">{s.translations.es?.description}</td>
                <td className="px-6 py-4">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    s.status === "active" ? "bg-[#DCFCE7] text-[#16A34A]" : "bg-[#F1F5F9] text-[#64748B]"
                  }`}>{s.status}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => handleEdit(s.id)} className="text-[#94A3B8] hover:text-[#2563EB]"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(s.id)} className="text-[#94A3B8] hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
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
            <h2 className="text-lg font-bold text-[#0F172A] mb-6">Editar Servicio</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#64748B] mb-1">Nombre (ES)</label>
                  <input value={form.name_es} onChange={(e) => setForm({...form, name_es: e.target.value})} className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#2563EB]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#64748B] mb-1">Name (EN)</label>
                  <input value={form.name_en} onChange={(e) => setForm({...form, name_en: e.target.value})} className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#2563EB]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#64748B] mb-1">Descripción (ES)</label>
                  <textarea value={form.description_es} onChange={(e) => setForm({...form, description_es: e.target.value})} rows={3} className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#2563EB] resize-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#64748B] mb-1">Description (EN)</label>
                  <textarea value={form.description_en} onChange={(e) => setForm({...form, description_en: e.target.value})} rows={3} className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#2563EB] resize-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#64748B] mb-1">Icono (Lucide name)</label>
                  <input value={form.iconName} onChange={(e) => setForm({...form, iconName: e.target.value})} className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#2563EB]" />
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
            <div className="flex gap-3 mt-6">
              <button onClick={handleSave} className="flex-1 px-4 py-2.5 rounded-xl bg-[#2563EB] text-white font-semibold text-sm hover:bg-[#1d4ed8]">{t("admin.save")}</button>
              <button onClick={() => setEditing(null)} className="px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-[#64748B] font-semibold text-sm">{t("admin.cancel")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
