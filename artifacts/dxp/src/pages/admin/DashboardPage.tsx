import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Package, Wrench, BookOpen, HelpCircle, Mail, Image, TrendingUp, Clock } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { useAdminStore } from "@/lib/admin-store";

export function DashboardPage() {
  const { t } = useTranslation();
  const store = useAdminStore();

  const stats = [
    { href: "/admin/products", label: t("admin.total_products"), value: store.products.length, active: store.products.filter((p) => p.status === "active").length, icon: Package, color: "#2563EB" },
    { href: "/admin/services", label: t("admin.total_services"), value: store.services.length, active: store.services.filter((s) => s.status === "active").length, icon: Wrench, color: "#06B6D4" },
    { href: "/admin/case-studies", label: t("admin.total_case_studies"), value: store.caseStudies.length, active: store.caseStudies.filter((c) => c.status === "active").length, icon: BookOpen, color: "#10B981" },
    { href: "/admin/faq", label: t("admin.total_faq"), value: store.faq.length, active: store.faq.filter((f) => f.status === "active").length, icon: HelpCircle, color: "#8B5CF6" },
    { href: "/admin/contact", label: t("admin.contact"), value: store.contactMessages.length, active: store.contactMessages.filter((m) => m.status === "new").length, icon: Mail, color: "#F59E0B", activeLabel: t("admin.new_messages") },
    { href: "/admin/media", label: t("admin.media"), value: store.mediaFiles.length, active: store.mediaFiles.length, icon: Image, color: "#EC4899" },
  ];

  const newMessages = store.contactMessages.filter((m) => m.status === "new");

  return (
    <div data-testid="dashboard-page">
      <PageHeader
        title={t("admin.dashboard")}
        description="Resumen del estado del contenido del sitio."
      />

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="block bg-white rounded-2xl border border-[#E2E8F0] p-5 hover:shadow-md hover:border-[#CBD5E1] transition-all"
            data-testid={`stat-card-${s.label}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `${s.color}15` }}
              >
                <s.icon className="w-5 h-5" style={{ color: s.color }} />
              </div>
              <span className="text-3xl font-bold text-[#0F172A]">{s.value}</span>
            </div>
            <div className="text-sm font-medium text-[#64748B]">{s.label}</div>
            <div className="text-xs text-[#94A3B8] mt-0.5">
              {s.active} {s.activeLabel ?? t("admin.active").toLowerCase()}
            </div>
          </Link>
        ))}
      </div>

      {/* New messages */}
      {newMessages.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Mail className="w-5 h-5 text-[#F59E0B]" />
            <h2 className="font-semibold text-[#0F172A]">
              {newMessages.length} {t("admin.new_messages")}
            </h2>
          </div>
          <div className="space-y-3">
            {newMessages.slice(0, 5).map((msg) => (
              <div
                key={msg.id}
                className="flex items-start gap-3 p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]"
                data-testid={`message-preview-${msg.id}`}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2563EB] to-[#06B6D4] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {msg.name[0]?.toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-[#0F172A]">{msg.name}</div>
                  <div className="text-xs text-[#94A3B8]">{msg.email}</div>
                  <div className="text-xs text-[#64748B] mt-1 truncate">{msg.message}</div>
                </div>
                <div className="text-xs text-[#94A3B8] flex-shrink-0 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(msg.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content overview */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-[#2563EB]" />
          <h2 className="font-semibold text-[#0F172A]">Resumen de Contenido</h2>
        </div>
        <div className="space-y-3">
          {store.products.map((p) => (
            <div key={p.id} className="flex items-center justify-between py-2 border-b border-[#F1F5F9] last:border-0">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-[#2563EB]" />
                <span className="text-sm text-[#0F172A]">{p.translations.es.name}</span>
              </div>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  p.status === "active" ? "bg-[#DCFCE7] text-[#16A34A]" : "bg-[#F1F5F9] text-[#64748B]"
                }`}
              >
                {p.status}
              </span>
            </div>
          ))}
          {store.services.slice(0, 3).map((s) => (
            <div key={s.id} className="flex items-center justify-between py-2 border-b border-[#F1F5F9] last:border-0">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-[#06B6D4]" />
                <span className="text-sm text-[#0F172A]">{s.translations.es.name}</span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-[#DCFCE7] text-[#16A34A]">
                {s.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
