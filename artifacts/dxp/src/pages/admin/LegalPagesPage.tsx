import { useState } from "react";
import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/admin/PageHeader";
import { LangToggle, TextField, TextAreaField } from "@/components/admin/AdminUI";
import { useAdminStore, downloadJson } from "@/lib/admin-store";
import { useAdminLang } from "@/lib/admin-lang";

const PAGES = ["privacy", "terms"] as const;

export function LegalPagesPage() {
  const { t } = useTranslation();
  const { legal, setLegal } = useAdminStore();
  const { lang } = useAdminLang();
  const [draft, setDraft] = useState(() => structuredClone(legal));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const update = (
    page: (typeof PAGES)[number],
    field: "title" | "updated" | "body",
    value: string,
  ) =>
    setDraft((prev) => {
      const next = structuredClone(prev);
      next[page].translations[lang][field] = value;
      return next;
    });

  const save = async () => {
    setSaving(true);
    setLegal(draft);
    await downloadJson("legal.json", draft);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div data-testid="legal-page-admin">
      <PageHeader
        title={t("admin.legal")}
        description="Edita las páginas de Privacidad y Términos."
        onSave={save}
        saving={saving}
        saved={saved}
      />

      <div className="space-y-6 max-w-3xl">
        <LangToggle />
        {PAGES.map((page) => {
          const tr = draft[page].translations[lang];
          return (
            <div key={page} className="bg-white rounded-2xl border border-[#E2E8F0] p-6 space-y-3">
              <h2 className="text-sm font-bold uppercase tracking-widest text-[#0F172A]">
                {page === "privacy" ? "Privacidad / Privacy" : "Términos / Terms"}
                <span className="ml-2 font-mono text-xs font-normal text-[#94A3B8]">/{page}</span>
              </h2>
              <TextField label="Título" value={tr.title} onChange={(v) => update(page, "title", v)} />
              <TextField label="Última actualización" value={tr.updated} onChange={(v) => update(page, "updated", v)} />
              <TextAreaField label="Contenido" value={tr.body} onChange={(v) => update(page, "body", v)} rows={10} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
