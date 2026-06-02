import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Activity, GitCommit as GitCommitIcon, RefreshCw, ChevronLeft, ChevronRight, GitBranch } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { useAdminStore } from "@/lib/admin-store";
import { fetchGitLog, type GitCommit } from "@/lib/local-cms";

const PAGE_SIZE = 10;

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

  // --- Recent commits (auto-loads on entering the section) ---
  const [skip, setSkip] = useState(0);
  const [commits, setCommits] = useState<GitCommit[]>([]);
  const [branch, setBranch] = useState("");
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [available, setAvailable] = useState(true);

  const load = useCallback(async (nextSkip: number) => {
    setLoading(true);
    const res = await fetchGitLog(nextSkip, PAGE_SIZE);
    if (res.ok && res.commits) {
      setCommits(res.commits);
      setBranch(res.branch ?? "");
      setTotal(res.total ?? 0);
      setSkip(nextSkip);
      setAvailable(true);
    } else {
      setAvailable(false);
    }
    setLoading(false);
  }, []);

  // Fetch the latest commits whenever the page mounts (section is entered).
  useEffect(() => {
    load(0);
  }, [load]);

  const page = Math.floor(skip / PAGE_SIZE) + 1;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const canPrev = skip > 0;
  const canNext = skip + PAGE_SIZE < total;

  return (
    <div data-testid="diagnostics-page">
      <PageHeader
        title={t("admin.diagnostics")}
        description="Estado del sistema y estadísticas de contenido."
      />

      {/* Status banner */}
      <div className={`rounded-2xl border p-5 mb-6 flex items-center gap-3 ${
        allOk
          ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800"
          : "bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800"
      }`}>
        <Activity className={`w-5 h-5 ${allOk ? "text-emerald-600 dark:text-emerald-400" : "text-amber-700 dark:text-amber-400"}`} />
        <span className={`font-semibold text-sm ${allOk ? "text-emerald-700 dark:text-emerald-300" : "text-amber-700 dark:text-amber-300"}`}>
          {allOk ? "Sistema operando con normalidad" : "Algunos elementos requieren atención"}
        </span>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Content checks */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h2 className="font-semibold text-foreground mb-4">Verificación de Contenido</h2>
          <div className="space-y-2">
            {checks.map((c) => (
              <div key={c.label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <span className="text-sm text-muted-foreground">{c.label}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  c.ok
                    ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400"
                    : "bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400"
                }`}>
                  {c.ok ? "OK" : "Missing"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Content stats */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h2 className="font-semibold text-foreground mb-4">Estadísticas de Contenido</h2>
          <div className="space-y-2">
            {stats.map((s) => (
              <div key={s.label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <span className="text-sm text-muted-foreground">{s.label}</span>
                <span className="text-sm font-bold text-foreground">{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* System info */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h2 className="font-semibold text-foreground mb-4">Información del Sistema</h2>
          <div className="space-y-2">
            {[
              { label: "Plataforma", value: "Pacific Code Labs DXP" },
              { label: "Versión", value: "1.0.0" },
              { label: "Modo", value: "Local JSON" },
              { label: "Idioma activo", value: store.languages.find(l => l.isDefault)?.name ?? "Español" },
              { label: "Tema activo", value: store.themes.find(t => t.isActive)?.name ?? "Default" },
              { label: "Build", value: new Date().toLocaleDateString() },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <span className="text-sm text-muted-foreground">{item.label}</span>
                <span className="text-xs font-mono bg-muted px-2 py-1 rounded text-muted-foreground">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent commits */}
        <div className="bg-card rounded-2xl border border-border p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <GitCommitIcon className="w-4 h-4 text-muted-foreground" />
              {t("admin.recentCommits")}
            </h2>
            <div className="flex items-center gap-2">
              {available && branch && (
                <span className="hidden sm:flex items-center gap-1 text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">
                  <GitBranch className="w-3 h-3" />
                  {branch}
                </span>
              )}
              <button
                onClick={() => load(skip)}
                disabled={loading}
                className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                title={t("admin.refresh")}
                aria-label={t("admin.refresh")}
                data-testid="commits-refresh"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          {!available ? (
            <p className="text-sm text-muted-foreground py-6 text-center">{t("admin.commitsUnavailable")}</p>
          ) : (
            <>
              {/* Scrollable list — never grows past max-height (10 rows fit). */}
              <div className="max-h-80 overflow-y-auto -mx-2 px-2 flex-1">
                <div className="space-y-1">
                  {commits.map((c) => (
                    <div
                      key={c.hash}
                      className="flex items-start gap-3 py-2 border-b border-border last:border-0"
                      data-testid="commit-row"
                    >
                      <code className="text-xs font-mono text-primary bg-muted px-1.5 py-0.5 rounded shrink-0 mt-0.5">
                        {c.shortHash}
                      </code>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-foreground truncate" title={c.subject}>{c.subject}</p>
                        <p className="text-xs text-muted-foreground">
                          {c.author} · {new Date(c.date).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {commits.length === 0 && !loading && (
                    <p className="text-sm text-muted-foreground py-6 text-center">{t("admin.commitsUnavailable")}</p>
                  )}
                </div>
              </div>

              {/* Pagination — only when there are more than one page of commits. */}
              {total > PAGE_SIZE && (
                <div className="flex items-center justify-between pt-3 mt-1 border-t border-border">
                  <span className="text-xs text-muted-foreground">{page} / {totalPages}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => canPrev && load(skip - PAGE_SIZE)}
                      disabled={!canPrev || loading}
                      className="flex items-center gap-1 h-8 px-2.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                      data-testid="commits-prev"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      {t("admin.prev")}
                    </button>
                    <button
                      onClick={() => canNext && load(skip + PAGE_SIZE)}
                      disabled={!canNext || loading}
                      className="flex items-center gap-1 h-8 px-2.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                      data-testid="commits-next"
                    >
                      {t("admin.next")}
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
