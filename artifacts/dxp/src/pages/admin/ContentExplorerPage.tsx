import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronRight, ChevronDown, FileJson } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { useAdminStore } from "@/lib/admin-store";

function JsonTree({ data, depth = 0 }: { data: unknown; depth?: number }) {
  const [open, setOpen] = useState(depth < 2);

  if (Array.isArray(data)) {
    return (
      <span>
        <button onClick={() => setOpen(!open)} className="inline-flex items-center gap-0.5 text-[#94A3B8] hover:text-[#64748B]">
          {open ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          <span className="text-[#64748B] text-xs">[{data.length}]</span>
        </button>
        {open && (
          <div className="ml-4 border-l border-[#E2E8F0] pl-3 mt-0.5">
            {data.map((v, i) => (
              <div key={i} className="my-0.5 text-xs">
                <span className="text-[#94A3B8]">{i}: </span>
                <JsonTree data={v} depth={depth + 1} />
              </div>
            ))}
          </div>
        )}
      </span>
    );
  }

  if (data && typeof data === "object") {
    const entries = Object.entries(data);
    return (
      <span>
        <button onClick={() => setOpen(!open)} className="inline-flex items-center gap-0.5 text-[#94A3B8] hover:text-[#64748B]">
          {open ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          <span className="text-[#64748B] text-xs">{"{"}…{"}"}</span>
        </button>
        {open && (
          <div className="ml-4 border-l border-[#E2E8F0] pl-3 mt-0.5">
            {entries.map(([k, v]) => (
              <div key={k} className="my-0.5 text-xs">
                <span className="text-[#2563EB] font-medium">{k}</span>
                <span className="text-[#94A3B8]">: </span>
                <JsonTree data={v} depth={depth + 1} />
              </div>
            ))}
          </div>
        )}
      </span>
    );
  }

  if (typeof data === "string") return <span className="text-[#10B981]">"{data}"</span>;
  if (typeof data === "number") return <span className="text-[#F59E0B]">{data}</span>;
  if (typeof data === "boolean") return <span className="text-[#8B5CF6]">{String(data)}</span>;
  return <span className="text-[#94A3B8]">null</span>;
}

export function ContentExplorerPage() {
  const { t } = useTranslation();
  const store = useAdminStore();
  const [selected, setSelected] = useState("products");

  const files: Record<string, unknown> = {
    hero: store.hero,
    products: store.products,
    services: store.services,
    caseStudies: store.caseStudies,
    faq: store.faq,
    philosophy: store.philosophy,
    navigation: store.navigation,
    footer: store.footer,
    seo: store.seo,
    languages: store.languages,
    themes: store.themes,
  };

  return (
    <div data-testid="content-explorer-page">
      <PageHeader
        title={t("admin.contentExplorer")}
        description="Inspecciona el árbol de contenido JSON en tiempo real."
      />

      <div className="flex gap-6">
        {/* File list */}
        <div className="w-48 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
            {Object.keys(files).map((key) => (
              <button
                key={key}
                onClick={() => setSelected(key)}
                className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left border-b border-[#F1F5F9] last:border-0 transition-colors ${
                  selected === key ? "bg-[#EFF6FF] text-[#2563EB] font-medium" : "text-[#64748B] hover:bg-[#F8FAFC]"
                }`}
                data-testid={`explorer-file-${key}`}
              >
                <FileJson className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate font-mono text-xs">{key}.json</span>
              </button>
            ))}
          </div>
        </div>

        {/* JSON view */}
        <div className="flex-1 bg-white rounded-2xl border border-[#E2E8F0] p-5 overflow-auto min-h-64">
          <div className="font-mono text-xs">
            <JsonTree data={files[selected]} depth={0} />
          </div>
        </div>
      </div>
    </div>
  );
}
