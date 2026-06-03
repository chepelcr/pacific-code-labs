import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Edit2, Trash2, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { BilingualField, BilingualTextArea, BilingualSection } from "@/components/admin/AdminUI";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { useAdminStore, downloadJson } from "@/lib/admin-store";
import type { Lang } from "@/lib/translate";
import { ICON_NAMES } from "@/lib/icons";
import { RICH_TEXT_HINT } from "@/lib/rich-text";

const selectCls =
  "w-full h-10 rounded-xl border border-border bg-card px-3 text-sm focus:outline-none focus:border-primary";

interface ProductForm {
  es: { name: string; tagline: string; description: string };
  en: { name: string; tagline: string; description: string };
  externalUrl: string;
  iconName: string;
  status: string;
  logoUrl: string;
}

const emptyTr = { name: "", tagline: "", description: "" };

export function ProductsPage() {
  const { t } = useTranslation();
  const { products, setProducts } = useAdminStore();
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>({
    es: { ...emptyTr },
    en: { ...emptyTr },
    externalUrl: "",
    iconName: "",
    status: "active",
    logoUrl: "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const persist = async () => {
    setSaving(true);
    await downloadJson("products.json", products);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const setTr = (lang: Lang, key: keyof typeof emptyTr, value: string) =>
    setForm((f) => ({ ...f, [lang]: { ...f[lang], [key]: value } }));

  const handleEdit = (id: string) => {
    const p = products.find((x) => x.id === id);
    if (!p) return;
    setForm({
      es: { ...emptyTr, ...p.translations.es },
      en: { ...emptyTr, ...p.translations.en },
      externalUrl: p.externalUrl ?? "",
      iconName: p.iconName ?? "",
      status: p.status,
      logoUrl: p.logoUrl ?? "",
    });
    setEditing(id);
  };

  const handleApply = () => {
    if (!editing) return;
    setProducts(
      products.map((p) =>
        p.id === editing
          ? {
              ...p,
              status: form.status as "active" | "draft" | "archived",
              externalUrl: form.externalUrl || null,
              logoUrl: form.logoUrl || null,
              iconName: form.iconName || "Boxes",
              translations: {
                ...p.translations,
                es: { ...p.translations.es, ...form.es },
                en: { ...p.translations.en, ...form.en },
              },
              updatedAt: new Date().toISOString(),
            }
          : p,
      ) as typeof products,
    );
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
        description="Gestiona los productos. Guarda para escribir products.json."
        onSave={persist}
        saving={saving}
        saved={saved}
        entity="products.json"
        value={products}
      />

      <div className="space-y-4">
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <table className="w-full text-sm" data-testid="products-table">
            <thead>
              <tr className="border-b border-border bg-background">
                <th className="text-left px-6 py-3 font-semibold text-muted-foreground">Producto</th>
                <th className="text-left px-6 py-3 font-semibold text-muted-foreground hidden md:table-cell">Tagline</th>
                <th className="text-left px-6 py-3 font-semibold text-muted-foreground">Estado</th>
                <th className="text-right px-6 py-3 font-semibold text-muted-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0 hover:bg-background" data-testid={`product-row-${p.id}`}>
                  <td className="px-6 py-4 font-medium text-foreground">{p.translations.es?.name}</td>
                  <td className="px-6 py-4 text-muted-foreground hidden md:table-cell max-w-xs truncate">{p.translations.es?.tagline}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      p.status === "active" ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400" :
                      p.status === "draft" ? "bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400" : "bg-muted text-muted-foreground"
                    }`}>{p.status}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {p.externalUrl && (
                        <a href={p.externalUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-muted-foreground"><ExternalLink className="w-4 h-4" /></a>
                      )}
                      <button onClick={() => handleEdit(p.id)} className="text-muted-foreground hover:text-primary" data-testid={`edit-product-${p.id}`}><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(p.id)} className="text-muted-foreground hover:text-red-600 dark:hover:text-red-400" data-testid={`delete-product-${p.id}`}><Trash2 className="w-4 h-4" /></button>
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
          <div className="bg-card rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-foreground mb-6">Editar Producto</h2>
            <div className="space-y-4">
              <BilingualSection>
                <BilingualField label="Nombre" es={form.es.name} en={form.en.name} onChange={(l, v) => setTr(l, "name", v)} />
                <BilingualField label="Tagline" es={form.es.tagline} en={form.en.tagline} onChange={(l, v) => setTr(l, "tagline", v)} />
                <BilingualTextArea label="Descripción" es={form.es.description} en={form.en.description} onChange={(l, v) => setTr(l, "description", v)} rows={3} hint={RICH_TEXT_HINT} />
              </BilingualSection>
              <div className="grid grid-cols-3 gap-4 bg-card rounded-2xl border border-border p-6">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">URL externa</label>
                  <input type="url" value={form.externalUrl} onChange={(e) => setForm({ ...form, externalUrl: e.target.value })} className={`${selectCls} font-mono`} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Icono</label>
                  <select value={form.iconName} onChange={(e) => setForm({ ...form, iconName: e.target.value })} className={selectCls} data-testid="select-product-icon">
                    {ICON_NAMES.map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Estado</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={selectCls} data-testid="select-product-status">
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                <div className="col-span-3">
                  <MediaPicker
                    label={t("admin.identity.logo", "Logo")}
                    hint={t("products.logoHint", "Optional. Falls back to the selected icon when empty.")}
                    value={form.logoUrl}
                    onChange={(v) => setForm({ ...form, logoUrl: v })}
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleApply} className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90" data-testid="btn-save-product">{t("admin.save")}</button>
              <button onClick={() => setEditing(null)} className="px-4 py-2.5 rounded-xl border border-border text-muted-foreground font-semibold text-sm">{t("admin.cancel")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
