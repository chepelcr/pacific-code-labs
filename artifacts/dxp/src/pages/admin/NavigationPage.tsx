import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { LangToggle, TextField } from "@/components/admin/AdminUI";
import { useAdminStore, downloadJson } from "@/lib/admin-store";
import { useAdminLang } from "@/lib/admin-lang";

export function NavigationPage() {
  const { t } = useTranslation();
  const { navigation, setNavigation } = useAdminStore();
  const { lang } = useAdminLang();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const items = [...navigation.items].sort((a, b) => a.order - b.order);

  const updateItem = (idx: number, field: "href" | "label", value: string) => {
    setNavigation({
      items: items.map((item, i) =>
        i !== idx
          ? item
          : field === "label"
            ? { ...item, label: { ...item.label, [lang]: value } }
            : { ...item, href: value },
      ),
    });
  };

  const addItem = () =>
    setNavigation({ items: [...items, { href: "/", order: items.length + 1, label: { es: "Nuevo", en: "New" } }] });

  const removeItem = (idx: number) => setNavigation({ items: items.filter((_, i) => i !== idx) });

  const persist = async () => {
    setSaving(true);
    await downloadJson("navigation.json", navigation);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div data-testid="navigation-page">
      <PageHeader
        title={t("admin.navigation")}
        description="Edita los enlaces de navegación. Guarda para escribir navigation.json."
        onSave={persist}
        saving={saving}
        saved={saved}
        action={
          <button onClick={addItem} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#E2E8F0] bg-white text-[#0F172A] text-sm font-medium hover:border-[#CBD5E1]">
            <Plus className="w-4 h-4" />
            {t("admin.add")}
          </button>
        }
      />

      <div className="space-y-4 max-w-2xl">
        <LangToggle />
        <div className="space-y-2">
          {items.map((item, idx) => (
            <div key={idx} className="bg-white rounded-xl border border-[#E2E8F0] p-3 flex items-center gap-3" data-testid={`nav-item-${idx}`}>
              <GripVertical className="w-4 h-4 text-[#CBD5E1] flex-shrink-0" />
              <TextField className="flex-1" value={item.label[lang] ?? ""} onChange={(v) => updateItem(idx, "label", v)} placeholder={lang === "es" ? "Etiqueta" : "Label"} />
              <TextField className="w-40" value={item.href} onChange={(v) => updateItem(idx, "href", v)} placeholder="/section" type="url" />
              <button onClick={() => removeItem(idx)} className="text-[#94A3B8] hover:text-red-500 flex-shrink-0">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
