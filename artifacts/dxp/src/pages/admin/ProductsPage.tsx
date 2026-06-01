import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Edit2, Trash2, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { useAdminStore, downloadJson } from "@/lib/admin-store";
import { ICON_NAMES } from "@/lib/icons";

export function ProductsPage() {
  const { t } = useTranslation();
  const { products, setProducts } = useAdminStore();
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});

  const handleEdit = (id: string) => {
    const p = products.find((x) => x.id === id);
    if (!p) return;
    setForm({
      name_es: p.translations.es?.name ?? "",
      tagline_es: p.translations.es?.tagline ?? "",
      description_es: p.translations.es?.description ?? "",
      name_en: p.translations.en?.name ?? "",
      tagline_en: p.translations.en?.tagline ?? "",
      description_en: p.translations.en?.description ?? "",
      externalUrl: p.externalUrl ?? "",
      iconName: p.iconName ?? "",
      status: p.status,
    });
    setEditing(id);
  };

  const handleSave = () => {
    if (!editing) return;
    const updated = products.map((p) =>
      p.id === editing
        ? {
            ...p,
            status: form.status as "active" | "draft" | "archived",
            externalUrl: form.externalUrl || null,
            iconName: form.iconName || "Boxes",
            translations: {
              ...p.translations,
              es: { ...p.translations.es, name: form.name_es, tagline: form.tagline_es, description: form.description_es },
              en: { ...p.translations.en, name: form.name_en, tagline: form.tagline_en, description: form.description_en },
            },
            updatedAt: new Date().toISOString(),
          }
        : p
    );
    setProducts(updated as typeof products);
    setEditing(null);
  };

  const handleDelete = (id: string) => {
    if (!confirm("¿Eliminar este producto?")) return;
    setProducts(products.filter((p) => p.id !== id));
  };

  return (
    <div data-testid="products-page">
      <PageHeader
        title={t("admin.products")}
        description="Gestiona los productos de la plataforma."
        onExport={() => downloadJson("products.json", products)}
      />

      <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
        <table className="w-full text-sm" data-testid="products-table">
          <thead>
            <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
              <th className="text-left px-6 py-3 font-semibold text-[#64748B]">Producto</th>
              <th className="text-left px-6 py-3 font-semibold text-[#64748B] hidden md:table-cell">Tagline (ES)</th>
              <th className="text-left px-6 py-3 font-semibold text-[#64748B]">Estado</th>
              <th className="text-right px-6 py-3 font-semibold text-[#64748B]">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-[#F1F5F9] last:border-0 hover:bg-[#F8FAFC]" data-testid={`product-row-${p.id}`}>
                <td className="px-6 py-4 font-medium text-[#0F172A]">{p.translations.es?.name}</td>
                <td className="px-6 py-4 text-[#64748B] hidden md:table-cell max-w-xs truncate">{p.translations.es?.tagline}</td>
                <td className="px-6 py-4">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    p.status === "active" ? "bg-[#DCFCE7] text-[#16A34A]" :
                    p.status === "draft" ? "bg-[#FEF9C3] text-[#854D0E]" :
                    "bg-[#F1F5F9] text-[#64748B]"
                  }`}>
                    {p.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    {p.externalUrl && (
                      <a href={p.externalUrl} target="_blank" rel="noopener noreferrer" className="text-[#94A3B8] hover:text-[#64748B]">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    <button onClick={() => handleEdit(p.id)} className="text-[#94A3B8] hover:text-[#2563EB]" data-testid={`edit-product-${p.id}`}>
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="text-[#94A3B8] hover:text-red-500" data-testid={`delete-product-${p.id}`}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-[#0F172A] mb-6">Editar Producto</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#64748B] mb-1">Nombre (ES)</label>
                  <input value={form.name_es} onChange={(e) => setForm({...form, name_es: e.target.value})} className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#2563EB]" data-testid="input-product-name-es" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#64748B] mb-1">Name (EN)</label>
                  <input value={form.name_en} onChange={(e) => setForm({...form, name_en: e.target.value})} className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#2563EB]" data-testid="input-product-name-en" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#64748B] mb-1">Tagline (ES)</label>
                  <input value={form.tagline_es} onChange={(e) => setForm({...form, tagline_es: e.target.value})} className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#2563EB]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#64748B] mb-1">Tagline (EN)</label>
                  <input value={form.tagline_en} onChange={(e) => setForm({...form, tagline_en: e.target.value})} className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#2563EB]" />
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
                  <label className="block text-xs font-semibold text-[#64748B] mb-1">URL externa</label>
                  <input value={form.externalUrl} onChange={(e) => setForm({...form, externalUrl: e.target.value})} className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#2563EB]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#64748B] mb-1">Estado</label>
                  <select value={form.status} onChange={(e) => setForm({...form, status: e.target.value})} className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#2563EB] bg-white" data-testid="select-product-status">
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#64748B] mb-1">Icono</label>
                <select value={form.iconName} onChange={(e) => setForm({...form, iconName: e.target.value})} className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#2563EB] bg-white" data-testid="select-product-icon">
                  {ICON_NAMES.map((name) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
                <p className="text-[11px] text-[#94A3B8] mt-1">Se usa cuando el producto no tiene logo (logoUrl).</p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleSave} className="flex-1 px-4 py-2.5 rounded-xl bg-[#2563EB] text-white font-semibold text-sm hover:bg-[#1d4ed8] transition-colors" data-testid="btn-save-product">
                {t("admin.save")}
              </button>
              <button onClick={() => setEditing(null)} className="px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-[#64748B] font-semibold text-sm hover:border-[#CBD5E1]">
                {t("admin.cancel")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
