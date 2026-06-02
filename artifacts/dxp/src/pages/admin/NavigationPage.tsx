import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { TextField, BilingualField, BilingualSection } from "@/components/admin/AdminUI";
import { useAdminStore, downloadJson } from "@/lib/admin-store";
import type { Lang } from "@/lib/translate";

export function NavigationPage() {
  const { t } = useTranslation();
  const { navigation, setNavigation } = useAdminStore();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const items = [...navigation.items].sort((a, b) => a.order - b.order);

  const updateLabel = (idx: number, lang: Lang, value: string) => {
    setNavigation({
      items: items.map((item, i) =>
        i !== idx ? item : { ...item, label: { ...item.label, [lang]: value } },
      ),
    });
  };

  const updateHref = (idx: number, value: string) => {
    setNavigation({
      items: items.map((item, i) => (i !== idx ? item : { ...item, href: value })),
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
        entity="navigation.json"
        value={navigation}
        action={
          <button onClick={addItem} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card text-foreground text-sm font-medium hover:border-input">
            <Plus className="w-4 h-4" />
            {t("admin.add")}
          </button>
        }
      />

      <div className="space-y-4">
        <BilingualSection title="Enlaces de navegación">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-start gap-3 pb-3 border-b border-border last:border-0 last:pb-0" data-testid={`nav-item-${idx}`}>
              <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-8" />
              <div className="flex-1 space-y-2">
                <BilingualField label="Etiqueta" es={item.label.es ?? ""} en={item.label.en ?? ""} onChange={(l, v) => updateLabel(idx, l, v)} />
                <TextField label="Enlace" value={item.href} onChange={(v) => updateHref(idx, v)} placeholder="/section" type="url" />
              </div>
              <button onClick={() => removeItem(idx)} className="text-muted-foreground hover:text-red-500 flex-shrink-0 mt-8">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </BilingualSection>
      </div>
    </div>
  );
}
