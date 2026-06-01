import { useTranslation } from "react-i18next";
import { Check } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { useAdminStore, downloadJson } from "@/lib/admin-store";

export function ThemesPage() {
  const { t } = useTranslation();
  const { themes, setThemes } = useAdminStore();

  const handleActivate = (id: string) => {
    setThemes(themes.map((th) => ({ ...th, isActive: th.id === id })) as typeof themes);
  };

  const active = themes.find((th) => th.isActive);

  return (
    <div data-testid="themes-page">
      <PageHeader
        title={t("admin.themes")}
        description={`Tema activo: ${active?.name ?? "—"}`}
        onExport={() => downloadJson("themes.json", themes)}
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {themes.map((theme) => (
          <div
            key={theme.id}
            className={`bg-white rounded-2xl border-2 p-5 transition-all cursor-pointer ${
              theme.isActive ? "border-[#2563EB] shadow-sm" : "border-[#E2E8F0] hover:border-[#CBD5E1]"
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
                <div className="font-semibold text-[#0F172A] text-sm">{theme.name}</div>
                {theme.isActive && (
                  <div className="flex items-center gap-1 text-xs text-[#2563EB] font-medium mt-0.5">
                    <Check className="w-3 h-3" />
                    Activo
                  </div>
                )}
              </div>
              {!theme.isActive && (
                <button
                  className="text-xs px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-[#64748B] hover:border-[#2563EB] hover:text-[#2563EB] transition-colors"
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
