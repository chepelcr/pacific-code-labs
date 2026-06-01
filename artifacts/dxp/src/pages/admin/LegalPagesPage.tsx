import { useState } from "react";
import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/admin/PageHeader";
import { useAdminStore, downloadJson } from "@/lib/admin-store";

const PAGES = ["privacy", "terms"] as const;
const LANGS = ["es", "en"] as const;
const inputCls =
  "w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#2563EB]";

export function LegalPagesPage() {
  const { t } = useTranslation();
  const { legal, setLegal } = useAdminStore();
  const [draft, setDraft] = useState(() => structuredClone(legal));

  const update = (
    page: (typeof PAGES)[number],
    lang: (typeof LANGS)[number],
    field: "title" | "updated" | "body",
    value: string,
  ) => {
    setDraft((prev) => {
      const next = structuredClone(prev);
      next[page].translations[lang][field] = value;
      return next;
    });
  };

  return (
    <div data-testid="legal-page-admin">
      <PageHeader
        title={t("admin.legal")}
        description="Edita las páginas de Privacidad y Términos."
        onExport={() => downloadJson("legal.json", draft)}
        action={
          <button
            onClick={() => setLegal(draft)}
            className="px-4 py-2 rounded-lg bg-[#2563EB] text-white font-semibold text-sm hover:bg-[#1d4ed8] transition-colors"
            data-testid="btn-save-legal"
          >
            {t("admin.save")}
          </button>
        }
      />

      <div className="space-y-6">
        {PAGES.map((page) => (
          <div key={page} className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
            <h2 className="text-sm font-bold uppercase tracking-widest text-[#0F172A] mb-4">
              {page === "privacy" ? "Privacidad / Privacy" : "Términos / Terms"}
              <span className="ml-2 font-mono text-xs font-normal text-[#94A3B8]">/{page}</span>
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {LANGS.map((lang) => {
                const tr = draft[page].translations[lang];
                return (
                  <div key={lang} className="space-y-3">
                    <div className="text-xs font-bold uppercase tracking-widest text-[#94A3B8]">
                      {lang === "es" ? "Español" : "English"}
                    </div>
                    <input
                      value={tr.title}
                      onChange={(e) => update(page, lang, "title", e.target.value)}
                      placeholder="Title"
                      className={inputCls}
                    />
                    <input
                      value={tr.updated}
                      onChange={(e) => update(page, lang, "updated", e.target.value)}
                      placeholder="Last updated…"
                      className={inputCls}
                    />
                    <textarea
                      value={tr.body}
                      onChange={(e) => update(page, lang, "body", e.target.value)}
                      rows={10}
                      className={`${inputCls} resize-y`}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
