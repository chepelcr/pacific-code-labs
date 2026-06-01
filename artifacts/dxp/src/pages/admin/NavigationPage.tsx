import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { useAdminStore, downloadJson } from "@/lib/admin-store";

export function NavigationPage() {
  const { t } = useTranslation();
  const { navigation, setNavigation } = useAdminStore();
  const [saved, setSaved] = useState(false);
  const items = [...navigation.items].sort((a, b) => a.order - b.order);

  const updateItem = (idx: number, field: string, value: string, lang?: string) => {
    const newItems = items.map((item, i) => {
      if (i !== idx) return item;
      if (lang) return { ...item, label: { ...item.label, [lang]: value } };
      return { ...item, [field]: value };
    });
    setNavigation({ items: newItems });
  };

  const addItem = () => {
    setNavigation({
      items: [...items, { href: "#", order: items.length + 1, label: { es: "Nuevo", en: "New" } }],
    });
  };

  const removeItem = (idx: number) => {
    setNavigation({ items: items.filter((_, i) => i !== idx) });
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div data-testid="navigation-page">
      <PageHeader
        title={t("admin.navigation")}
        description="Edita los enlaces de navegación del sitio."
        onExport={() => downloadJson("navigation.json", navigation)}
        action={
          <button onClick={addItem} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#2563EB] text-white text-sm font-medium hover:bg-[#1d4ed8]">
            <Plus className="w-4 h-4" />
            {t("admin.add")}
          </button>
        }
      />

      <div className="space-y-2 max-w-2xl mb-6">
        {items.map((item, idx) => (
          <div key={idx} className="bg-white rounded-xl border border-[#E2E8F0] p-4 flex items-center gap-3" data-testid={`nav-item-${idx}`}>
            <GripVertical className="w-4 h-4 text-[#CBD5E1] flex-shrink-0" />
            <input
              value={item.label.es ?? ""}
              onChange={(e) => updateItem(idx, "label", e.target.value, "es")}
              placeholder="Etiqueta ES"
              className="flex-1 px-2 py-1.5 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#2563EB] min-w-0"
            />
            <input
              value={item.label.en ?? ""}
              onChange={(e) => updateItem(idx, "label", e.target.value, "en")}
              placeholder="Label EN"
              className="flex-1 px-2 py-1.5 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#2563EB] min-w-0"
            />
            <input
              value={item.href}
              onChange={(e) => updateItem(idx, "href", e.target.value)}
              placeholder="#section"
              className="w-28 px-2 py-1.5 rounded-lg border border-[#E2E8F0] text-sm font-mono focus:outline-none focus:border-[#2563EB]"
            />
            <button onClick={() => removeItem(idx)} className="text-[#94A3B8] hover:text-red-500 flex-shrink-0">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={handleSave}
        className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors ${saved ? "bg-[#10B981] text-white" : "bg-[#2563EB] text-white hover:bg-[#1d4ed8]"}`}
        data-testid="btn-save-navigation"
      >
        {saved ? "Guardado" : t("admin.save")}
      </button>
    </div>
  );
}
