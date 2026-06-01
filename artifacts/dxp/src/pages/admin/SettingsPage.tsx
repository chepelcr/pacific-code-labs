import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/admin/PageHeader";

export function SettingsPage() {
  const { t } = useTranslation();

  return (
    <div data-testid="settings-page">
      <PageHeader title={t("admin.settings")} description="Configuración del sistema DXP." />
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-8 max-w-xl">
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-[#0F172A] mb-1">Nombre del sitio</h3>
            <p className="text-xs text-[#94A3B8] mb-2">Se muestra en el navegador y en compartir.</p>
            <input
              defaultValue="Pacific Code Labs"
              className="w-full px-3 py-2.5 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#2563EB]"
              data-testid="input-site-name"
            />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#0F172A] mb-1">Modo de almacenamiento</h3>
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <div className="w-2 h-2 rounded-full bg-[#10B981]" />
              <span className="text-sm text-[#475569]">JSON local (archivos en repositorio)</span>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#0F172A] mb-3">Acciones</h3>
            <div className="space-y-2">
              <button
                onClick={() => { localStorage.clear(); window.location.reload(); }}
                className="w-full px-4 py-2.5 rounded-xl border border-[#FCA5A5] text-[#DC2626] text-sm font-medium hover:bg-[#FEF2F2] transition-colors text-left"
                data-testid="btn-clear-storage"
              >
                Limpiar almacenamiento local
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
