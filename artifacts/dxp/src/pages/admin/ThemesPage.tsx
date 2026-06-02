import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Check } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { useAdminStore, downloadJson } from "@/lib/admin-store";

export function ThemesPage() {
  const { t } = useTranslation();
  const { themes, setThemes } = useAdminStore();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleActivate = (id: string) => {
    setThemes(themes.map((th) => ({ ...th, isActive: th.id === id })) as typeof themes);
  };

  const persist = async () => {
    setSaving(true);
    await downloadJson("themes.json", themes);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const active = themes.find((th) => th.isActive);

  return (
    <div data-testid="themes-page">
      <PageHeader
        title={t("admin.themes")}
        description={`Tema activo: ${active?.name ?? "—"}`}
        onSave={persist}
        saving={saving}
        saved={saved}
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {themes.map((theme) => (
          <div
            key={theme.id}
            className={`bg-card rounded-2xl border-2 p-5 transition-all cursor-pointer ${
              theme.isActive ? "border-primary shadow-sm" : "border-border hover:border-input"
            }`}
            onClick={() => handleActivate(theme.id)}
            data-testid={`theme-card-${theme.id}`}
          >
            {/* Color swatches */}
            <div className="flex gap-2 mb-4">
              {Object.values(theme.colors ?? {}).slice(0, 5).map((color, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full border border-white shadow-sm"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-foreground text-sm">{theme.name}</div>
                {theme.isActive && (
                  <div className="flex items-center gap-1 text-xs text-primary font-medium mt-0.5">
                    <Check className="w-3 h-3" />
                    Activo
                  </div>
                )}
              </div>
              {!theme.isActive && (
                <button
                  className="text-xs px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                  data-testid={`activate-theme-${theme.id}`}
                >
                  Activar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
