import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/admin/PageHeader";
import { downloadJson } from "@/lib/admin-store";
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
  "w-full px-3 py-2 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#2563EB]";

export function TranslationsPage() {
  const { t, i18n } = useTranslation();
  const [es, setEs] = useState<Flat>(() => flatten(esData as Record<string, unknown>));
  const [en, setEn] = useState<Flat>(() => flatten(enData as Record<string, unknown>));
  const [query, setQuery] = useState("");
  const [applied, setApplied] = useState(false);

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
            {applied && <span className="text-xs text-[#16A34A] font-medium">Aplicado ✓</span>}
            <button
              onClick={applyLive}
              className="px-4 py-2 rounded-lg bg-[#2563EB] text-white font-semibold text-sm hover:bg-[#1d4ed8] transition-colors"
              data-testid="btn-apply-translations"
            >
              {t("admin.save")}
            </button>
            <button
              onClick={() => downloadJson("es.json", unflatten(es))}
              className="px-3 py-2 rounded-lg border border-[#E2E8F0] bg-white text-[#64748B] hover:text-[#0F172A] hover:border-[#CBD5E1] text-sm font-medium transition-colors"
            >
              es.json
            </button>
            <button
              onClick={() => downloadJson("en.json", unflatten(en))}
              className="px-3 py-2 rounded-lg border border-[#E2E8F0] bg-white text-[#64748B] hover:text-[#0F172A] hover:border-[#CBD5E1] text-sm font-medium transition-colors"
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
          <div key={group} className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
            <div className="px-6 py-3 bg-[#F8FAFC] border-b border-[#E2E8F0]">
              <span className="text-xs font-bold uppercase tracking-widest text-[#64748B]">{group}</span>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E2E8F0] text-left text-xs text-[#94A3B8]">
                  <th className="px-6 py-2 font-semibold w-1/4">Clave</th>
                  <th className="px-6 py-2 font-semibold">Español</th>
                  <th className="px-6 py-2 font-semibold">English</th>
                </tr>
              </thead>
              <tbody>
                {groupKeys.map((k) => (
                  <tr key={k} className="border-b border-[#F1F5F9] last:border-0 align-top">
                    <td className="px-6 py-3">
                      <code className="text-[11px] font-mono text-[#2563EB] break-all">{k}</code>
                    </td>
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
