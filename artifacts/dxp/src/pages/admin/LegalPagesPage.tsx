import { useState } from "react";
import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/admin/PageHeader";
import { BilingualField, BilingualTextArea, BilingualSection } from "@/components/admin/AdminUI";
import { useAdminStore, downloadJson } from "@/lib/admin-store";
import type { Lang } from "@/lib/translate";

const PAGES = ["privacy", "terms"] as const;

export function LegalPagesPage() {
  const { t } = useTranslation();
  const { legal, setLegal } = useAdminStore();
  const [draft, setDraft] = useState(() => structuredClone(legal));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const update = (
    page: (typeof PAGES)[number],
    lang: Lang,
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

      <div className="space-y-6">
        {PAGES.map((page) => {
          const es = draft[page].translations.es;
          const en = draft[page].translations.en;
          return (
            <BilingualSection key={page} title={`${page === "privacy" ? "Privacidad / Privacy" : "Términos / Terms"} · /${page}`}>
              <BilingualField label="Título" es={es.title} en={en.title} onChange={(l, v) => update(page, l, "title", v)} />
              <BilingualField label="Última actualización" es={es.updated} en={en.updated} onChange={(l, v) => update(page, l, "updated", v)} />
              <BilingualTextArea label="Contenido" es={es.body} en={en.body} onChange={(l, v) => update(page, l, "body", v)} rows={10} />
            </BilingualSection>
          );
        })}
      </div>
    </div>
  );
}
