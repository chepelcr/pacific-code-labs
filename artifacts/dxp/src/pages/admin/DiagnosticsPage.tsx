import { useTranslation } from "react-i18next";
import { Activity, Check } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { useAdminStore } from "@/lib/admin-store";

export function DiagnosticsPage() {
  const { t } = useTranslation();
  const store = useAdminStore();

  const checks = [
    { label: "Hero content", ok: !!store.hero.translations.es.title },
    { label: "Products loaded", ok: store.products.length > 0 },
    { label: "Services loaded", ok: store.services.length > 0 },
    { label: "FAQ entries", ok: store.faq.length > 0 },
    { label: "Languages configured", ok: store.languages.length > 0 },
    { label: "Themes configured", ok: store.themes.length > 0 },
    { label: "SEO configured", ok: !!store.seo.siteTitle?.es },
    { label: "Navigation configured", ok: store.navigation.items.length > 0 },
  ];

  const stats = [
    { label: "Productos", value: store.products.length },
    { label: "Servicios", value: store.services.length },
    { label: "Casos de éxito", value: store.caseStudies.length },
    { label: "FAQ", value: store.faq.length },
    { label: "Idiomas", value: store.languages.length },
    { label: "Temas", value: store.themes.length },
    { label: "Mensajes de contacto", value: store.contactMessages.length },
  ];

  const allOk = checks.every((c) => c.ok);

  return (
    <div data-testid="diagnostics-page">
      <PageHeader
        title={t("admin.diagnostics")}
        description="Estado del sistema y estadísticas de contenido."
      />

      {/* Status banner */}
      <div className={`rounded-2xl border p-5 mb-6 flex items-center gap-3 ${
        allOk ? "bg-[#F0FDF4] border-[#86EFAC]" : "bg-[#FEF9C3] border-[#FDE047]"
      }`}>
        <Activity className={`w-5 h-5 ${allOk ? "text-[#16A34A]" : "text-[#854D0E]"}`} />
        <span className={`font-semibold text-sm ${allOk ? "text-[#166534]" : "text-[#854D0E]"}`}>
          {allOk ? "Sistema operando con normalidad" : "Algunos elementos requieren atención"}
        </span>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Content checks */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
          <h2 className="font-semibold text-[#0F172A] mb-4">Verificación de Contenido</h2>
          <div className="space-y-2">
            {checks.map((c) => (
              <div key={c.label} className="flex items-center justify-between py-2 border-b border-[#F1F5F9] last:border-0">
                <span className="text-sm text-[#475569]">{c.label}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  c.ok ? "bg-[#DCFCE7] text-[#16A34A]" : "bg-[#FEE2E2] text-[#DC2626]"
                }`}>
                  {c.ok ? "OK" : "Missing"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Content stats */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
          <h2 className="font-semibold text-[#0F172A] mb-4">Estadísticas de Contenido</h2>
          <div className="space-y-2">
            {stats.map((s) => (
              <div key={s.label} className="flex items-center justify-between py-2 border-b border-[#F1F5F9] last:border-0">
                <span className="text-sm text-[#475569]">{s.label}</span>
                <span className="text-sm font-bold text-[#0F172A]">{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* System info */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
          <h2 className="font-semibold text-[#0F172A] mb-4">Información del Sistema</h2>
          <div className="space-y-2">
            {[
              { label: "Plataforma", value: "Pacific Code Labs DXP" },
              { label: "Versión", value: "1.0.0" },
              { label: "Modo", value: "Local JSON" },
              { label: "Idioma activo", value: store.languages.find(l => l.isDefault)?.name ?? "Español" },
              { label: "Tema activo", value: store.themes.find(t => t.isActive)?.name ?? "Default" },
              { label: "Build", value: new Date().toLocaleDateString() },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-2 border-b border-[#F1F5F9] last:border-0">
                <span className="text-sm text-[#64748B]">{item.label}</span>
                <span className="text-xs font-mono bg-[#F1F5F9] px-2 py-1 rounded text-[#475569]">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
