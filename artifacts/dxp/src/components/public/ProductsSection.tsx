import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { ExternalLink, ArrowRight } from "lucide-react";
import { resolveIcon } from "@/lib/icons";
import { listActiveProducts } from "@/services/products.service";

export function ProductsSection() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as "es" | "en";
  const products = listActiveProducts();

  const productColors: Record<string, { from: string; to: string; border: string }> = {
    tsuru: { from: "#10B981", to: "#059669", border: "#10B981" },
    firecode: { from: "#F59E0B", to: "#D97706", border: "#F59E0B" },
  };

  return (
    <section
      id="products"
      className="py-24 bg-white dark:bg-[#111827] relative overflow-hidden"
      data-testid="products-section"
    >
      {/* Subtle bg */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#F8FAFC] to-white dark:from-[#0F172A] dark:to-[#111827]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2563EB]/8 text-[#2563EB] text-xs font-semibold uppercase tracking-widest mb-4">
            {t("products.title")}
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#0F172A] dark:text-white mb-4">
            {t("products.title")}
          </h2>
          <p className="text-[#64748B] dark:text-white/50 max-w-xl mx-auto">{t("products.subtitle")}</p>
        </div>

        {/* Products grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {products.map((product) => {
            const tr = product.translations[lang] ?? product.translations.es;
            const colors = productColors[product.id] ?? { from: "#2563EB", to: "#1d4ed8", border: "#2563EB" };
            const Icon = resolveIcon(product.iconName);

            return (
              <div
                key={product.id}
                className="group relative flex flex-col rounded-2xl border border-[#E2E8F0] dark:border-white/8 bg-white dark:bg-white/4 hover:shadow-xl dark:hover:bg-white/7 transition-all duration-300 overflow-hidden"
                data-testid={`product-card-${product.id}`}
              >
                {/* Top accent bar */}
                <div
                  className="h-1 w-full"
                  style={{ background: `linear-gradient(to right, ${colors.from}, ${colors.to})` }}
                />

                <div className="p-8 flex flex-col flex-1">
                  {/* Icon + name on one row, badge aligned right */}
                  <div className="flex items-center gap-4 mb-4">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${colors.from}15` }}
                    >
                      {product.logoUrl ? (
                        <img src={product.logoUrl} alt={tr.name} className="w-8 h-8 object-contain" />
                      ) : (
                        <Icon className="w-7 h-7" style={{ color: colors.from }} />
                      )}
                    </div>
                    <h3 className="text-2xl font-bold text-[#0F172A] dark:text-white min-w-0 truncate flex-1">
                      {tr.name}
                    </h3>
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-[#F0FDF4] text-[#16A34A] flex-shrink-0">
                      {t("products.active")}
                    </span>
                  </div>

                  <p
                    className="text-sm font-medium mb-4"
                    style={{ color: colors.from }}
                  >
                    {tr.tagline}
                  </p>
                  <p className="text-[#64748B] dark:text-white/50 text-sm leading-relaxed mb-8">{tr.description}</p>

                  {/* Actions — pinned to the bottom so footers align across cards */}
                  <div className="flex items-center gap-3 mt-auto pt-2">
                    <Link
                      href="/contact"
                      className="flex items-center gap-2 text-sm font-semibold text-[#2563EB] hover:text-[#1d4ed8] transition-colors"
                      data-testid={`product-learn-more-${product.id}`}
                    >
                      {t("products.learn_more")}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    {product.externalUrl && (
                      <a
                        href={product.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-sm text-[#94A3B8] dark:text-white/30 hover:text-[#64748B] dark:hover:text-white/60 transition-colors ml-auto"
                        data-testid={`product-visit-${product.id}`}
                      >
                        {t("products.visit")}
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
