import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown } from "lucide-react";
import faqData from "@/content/faq.json";

export function FaqSection() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as "es" | "en";
  const [open, setOpen] = useState<string | null>(null);

  const activeFaq = faqData
    .filter((f) => f.status === "active")
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <section
      id="faq"
      className="py-24 bg-[#F8FAFC]"
      data-testid="faq-section"
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2563EB]/8 text-[#2563EB] text-xs font-semibold uppercase tracking-widest mb-4">
            FAQ
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#0F172A] mb-4">
            {t("faq.title")}
          </h2>
          <p className="text-[#64748B]">{t("faq.subtitle")}</p>
        </div>

        <div className="space-y-3">
          {activeFaq.map((entry) => {
            const tr = entry.translations[lang] ?? entry.translations.es;
            const isOpen = open === entry.id;

            return (
              <div
                key={entry.id}
                className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? "border-[#2563EB]/30 bg-white shadow-sm"
                    : "border-[#E2E8F0] bg-white hover:border-[#CBD5E1]"
                }`}
                data-testid={`faq-item-${entry.id}`}
              >
                <button
                  className="w-full text-left px-6 py-5 flex items-center justify-between gap-4"
                  onClick={() => setOpen(isOpen ? null : entry.id)}
                  data-testid={`faq-toggle-${entry.id}`}
                >
                  <span className="text-[#0F172A] font-medium text-sm">{tr.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#94A3B8] flex-shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-[#2563EB]" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-5">
                    <p className="text-[#475569] text-sm leading-relaxed">{tr.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
