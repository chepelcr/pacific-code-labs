import { useState } from "react";
import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/admin/PageHeader";
import { TextField, BilingualField, BilingualSection } from "@/components/admin/AdminUI";
import { useAdminStore, downloadJson } from "@/lib/admin-store";
import type { Lang } from "@/lib/translate";

export function FooterPage() {
  const { t } = useTranslation();
  const { footer, setFooter } = useAdminStore();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const persist = async () => {
    setSaving(true);
    await downloadJson("footer.json", footer);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div data-testid="footer-page">
      <PageHeader
        title={t("admin.footer")}
        description="Edita el pie de página. Guarda para escribir footer.json."
        onSave={persist}
        saving={saving}
        saved={saved}
        entity="footer.json"
        value={footer}
      />

      <div className="space-y-4">
        <BilingualSection title="Copyright">
          <BilingualField
            es={footer.copyright?.es ?? ""}
            en={footer.copyright?.en ?? ""}
            onChange={(l: Lang, v) => setFooter({ ...footer, copyright: { ...footer.copyright, [l]: v } })}
          />
        </BilingualSection>

        <BilingualSection title="Enlaces">
          {footer.links.map((link, i) => (
            <div key={i} className="space-y-2 pb-3 border-b border-border last:border-0 last:pb-0">
              <BilingualField
                label="Etiqueta"
                es={link.label.es ?? ""}
                en={link.label.en ?? ""}
                onChange={(l: Lang, v) =>
                  setFooter({
                    ...footer,
                    links: footer.links.map((lk, j) => (j === i ? { ...lk, label: { ...lk.label, [l]: v } } : lk)),
                  })
                }
              />
              <TextField
                label="URL"
                type="url"
                value={link.url}
                onChange={(v) =>
                  setFooter({
                    ...footer,
                    links: footer.links.map((lk, j) => (j === i ? { ...lk, url: v } : lk)),
                  })
                }
                placeholder="/privacy"
              />
            </div>
          ))}
        </BilingualSection>
      </div>
    </div>
  );
}
