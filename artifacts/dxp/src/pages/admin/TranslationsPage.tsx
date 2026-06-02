import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Languages, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { useAutoTranslate } from "@/lib/use-auto-translate";
import { downloadJson } from "@/lib/admin-store";
import { translateText } from "@/lib/translate";
import esData from "@/translations/es.json";
import enData from "@/translations/en.json";

type Flat = Record<string, string>;

/** Flatten a nested translation object to dot-notation keys. */
function flatten(obj: Record<string, unknown>, prefix = "", out: Flat = {}): Flat {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      flatten(v as Record<string, unknown>, key, out);
    } else {
      out[key] = String(v);
    }
  }
  return out;
}

/** Rebuild a nested object from dot-notation keys. */
function unflatten(flat: Flat): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(flat)) {
    const parts = key.split(".");
    let node = out;
    parts.forEach((p, i) => {
      if (i === parts.length - 1) {
        node[p] = val;
      } else {
        node[p] = (node[p] as Record<string, unknown>) ?? {};
        node = node[p] as Record<string, unknown>;
      }
    });
  }
  return out;
}

const inputCls =
  "w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary";

export function TranslationsPage() {
  const { t, i18n } = useTranslation();
  const { enabled: autoTranslateEnabled } = useAutoTranslate();
  const [es, setEs] = useState<Flat>(() => flatten(esData as Record<string, unknown>));
  const [en, setEn] = useState<Flat>(() => flatten(enData as Record<string, unknown>));
  const [query, setQuery] = useState("");
  const [applied, setApplied] = useState(false);
  const [translatingGroup, setTranslatingGroup] = useState<string | null>(null);

  // Fill every empty English cell in a group from its Spanish source (on-device).
  const translateGroup = async (groupKeys: string[]) => {
    setTranslatingGroup(groupKeys[0]?.split(".")[0] ?? null);
    for (const k of groupKeys) {
      const src = es[k];
      if (!src?.trim() || en[k]?.trim()) continue;
      const out = await translateText(src, "es", "en");
      if (out) setEn((prev) => ({ ...prev, [k]: out }));
    }
    setTranslatingGroup(null);
  };

  // Union of keys, ordered by the Spanish (canonical) file then any EN extras.
  const keys = useMemo(() => {
    const all = [...Object.keys(es), ...Object.keys(en).filter((k) => !(k in es))];
    const q = query.trim().toLowerCase();
    return q
      ? all.filter(
          (k) =>
            k.toLowerCase().includes(q) ||
            es[k]?.toLowerCase().includes(q) ||
            en[k]?.toLowerCase().includes(q),
        )
      : all;
  }, [es, en, query]);

  // Group by the first key segment (e.g. "nav", "hero", "admin").
  const groups = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const k of keys) {
      const g = k.split(".")[0];
      if (!map.has(g)) map.set(g, []);
      map.get(g)!.push(k);
    }
    return [...map.entries()];
  }, [keys]);

  // Live-apply edits to the running app so changes are previewable immediately.
  const applyLive = () => {
    i18n.addResourceBundle("es", "translation", unflatten(es), true, true);
    i18n.addResourceBundle("en", "translation", unflatten(en), true, true);
    i18n.changeLanguage(i18n.language);
    setApplied(true);
    setTimeout(() => setApplied(false), 2000);
  };

  return (
    <div data-testid="translations-page">
      <PageHeader
        title={t("admin.translations")}
        description="Edita las cadenas de i18n (es.json / en.json). Exporta y haz commit para publicar."
        action={
          <div className="flex items-center gap-2">
            {applied && <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Aplicado ✓</span>}
            <button
              onClick={applyLive}
              className="px-4 py-2 rounded-lg bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors"
              data-testid="btn-apply-translations"
            >
              {t("admin.save")}
            </button>
            <button
              onClick={() => downloadJson("es.json", unflatten(es))}
              className="px-3 py-2 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:border-input text-sm font-medium transition-colors"
            >
              es.json
            </button>
            <button
              onClick={() => downloadJson("en.json", unflatten(en))}
              className="px-3 py-2 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:border-input text-sm font-medium transition-colors"
            >
              en.json
            </button>
          </div>
        }
      />

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar clave o texto…"
        className={`${inputCls} mb-6 max-w-md`}
        data-testid="input-translations-search"
      />

      <div className="space-y-6">
        {groups.map(([group, groupKeys]) => (
          <div key={group} className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="px-6 py-3 bg-background border-b border-border flex items-center justify-between gap-3">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{group}</span>
              {autoTranslateEnabled && (
                <button
                  onClick={() => translateGroup(groupKeys)}
                  disabled={translatingGroup === group}
                  className="flex items-center gap-1.5 h-7 px-2.5 rounded-lg bg-card border border-border text-muted-foreground text-xs font-semibold hover:border-primary hover:text-primary disabled:opacity-60 transition-colors"
                  title="ES → EN"
                >
                  {translatingGroup === group ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Languages className="w-3.5 h-3.5" />
                  )}
                  {translatingGroup === group ? t("admin.autoTranslating") : t("admin.autoTranslateSection")}
                </button>
              )}
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="px-6 py-2 font-semibold w-1/2">Español</th>
                  <th className="px-6 py-2 font-semibold w-1/2">English</th>
                </tr>
              </thead>
              <tbody>
                {groupKeys.map((k) => (
                  // The technical i18n key is kept as a hover title, not a column.
                  <tr key={k} title={k} className="border-b border-border last:border-0 align-top">
                    <td className="px-6 py-3">
                      <textarea
                        value={es[k] ?? ""}
                        onChange={(e) => setEs((prev) => ({ ...prev, [k]: e.target.value }))}
                        rows={1}
                        className={`${inputCls} resize-y min-h-[38px]`}
                      />
                    </td>
                    <td className="px-6 py-3">
                      <textarea
                        value={en[k] ?? ""}
                        onChange={(e) => setEn((prev) => ({ ...prev, [k]: e.target.value }))}
                        rows={1}
                        className={`${inputCls} resize-y min-h-[38px]`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}
