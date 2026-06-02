import { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Download } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { useAdminStore, downloadJson } from "@/lib/admin-store";
import type { InventoryNode } from "@/repositories/inventory.repository";

// Each module type gets a column (left → right: data → logic → UI) and a color
// from the brand palette, so the graph reads as a dependency flow.
const TYPE_META: Record<string, { col: number; color: string; label: string }> = {
  content: { col: 0, color: "#94A3B8", label: "Content" },
  repository: { col: 1, color: "#F59E0B", label: "Repository" },
  service: { col: 1, color: "#8B5CF6", label: "Service" },
  lib: { col: 2, color: "#10B981", label: "Lib" },
  hook: { col: 2, color: "#EC4899", label: "Hook" },
  component: { col: 3, color: "#06B6D4", label: "Component" },
  page: { col: 4, color: "#2563EB", label: "Page" },
};
const TYPES = Object.keys(TYPE_META);

const COL_W = 280;
const ROW_H = 30;
const NODE_W = 210;
const NODE_H = 22;
const PAD_X = 40;
const PAD_Y = 30;

export function InventoryPage() {
  const { t } = useTranslation();
  const { inventory } = useAdminStore();

  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [view, setView] = useState({ scale: 0.8, tx: 20, ty: 20 });
  const drag = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null);

  const visibleNodes = useMemo(
    () => inventory.nodes.filter((n) => !hidden.has(n.type)),
    [inventory.nodes, hidden],
  );

  // Lay out each type's column as a vertical stack, sorted by label.
  const positions = useMemo(() => {
    const byCol = new Map<number, InventoryNode[]>();
    for (const n of [...visibleNodes].sort((a, b) => a.label.localeCompare(b.label))) {
      const col = TYPE_META[n.type]?.col ?? 2;
      if (!byCol.has(col)) byCol.set(col, []);
      byCol.get(col)!.push(n);
    }
    const pos = new Map<string, { x: number; y: number }>();
    for (const [col, nodes] of byCol) {
      nodes.forEach((n, i) => {
        pos.set(n.id, { x: PAD_X + col * COL_W, y: PAD_Y + i * ROW_H });
      });
    }
    return pos;
  }, [visibleNodes]);

  const visibleIds = useMemo(() => new Set(visibleNodes.map((n) => n.id)), [visibleNodes]);
  const edges = useMemo(
    () => inventory.edges.filter((e) => visibleIds.has(e.from) && visibleIds.has(e.to)),
    [inventory.edges, visibleIds],
  );

  // Neighborhood of the selected node, used to highlight and to fill the panel.
  const neighborhood = useMemo(() => {
    if (!selected) return null;
    const uses = edges.filter((e) => e.from === selected).map((e) => e.to);
    const usedBy = edges.filter((e) => e.to === selected).map((e) => e.from);
    const related = new Set<string>([selected, ...uses, ...usedBy]);
    return { uses, usedBy, related };
  }, [selected, edges]);

  const width = PAD_X * 2 + 5 * COL_W;
  const height = useMemo(() => {
    let max = 0;
    const counts = new Map<number, number>();
    for (const n of visibleNodes) {
      const col = TYPE_META[n.type]?.col ?? 2;
      counts.set(col, (counts.get(col) ?? 0) + 1);
    }
    for (const c of counts.values()) max = Math.max(max, c);
    return PAD_Y * 2 + max * ROW_H;
  }, [visibleNodes]);

  const center = (id: string) => {
    const p = positions.get(id);
    return p ? { x: p.x + NODE_W / 2, y: p.y + NODE_H / 2 } : null;
  };

  const toggleType = (type: string) =>
    setHidden((prev) => {
      const next = new Set(prev);
      next.has(type) ? next.delete(type) : next.add(type);
      return next;
    });

  const queryLc = query.trim().toLowerCase();
  const matchesQuery = (n: InventoryNode) =>
    queryLc.length > 0 && (n.label.toLowerCase().includes(queryLc) || n.id.toLowerCase().includes(queryLc));

  const onWheel = (e: React.WheelEvent) => {
    const factor = e.deltaY < 0 ? 1.1 : 0.9;
    setView((v) => ({ ...v, scale: Math.min(3, Math.max(0.25, v.scale * factor)) }));
  };
  const onPointerDown = (e: React.PointerEvent) => {
    drag.current = { x: e.clientX, y: e.clientY, tx: view.tx, ty: view.ty };
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    setView((v) => ({
      ...v,
      tx: drag.current!.tx + (e.clientX - drag.current!.x),
      ty: drag.current!.ty + (e.clientY - drag.current!.y),
    }));
  };
  const onPointerUp = () => {
    drag.current = null;
  };

  const selectedNode = selected ? inventory.nodes.find((n) => n.id === selected) : null;

  return (
    <div data-testid="inventory-page">
      <PageHeader
        title={t("admin.inventory")}
        description={`${inventory.counts.nodes} módulos · ${inventory.counts.edges} relaciones · generado ${inventory.generatedAt.slice(0, 10)}`}
        action={
          <button
            onClick={() => downloadJson("inventory.json", inventory)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:border-input text-sm font-medium transition-colors"
          >
            <Download className="w-4 h-4" />
            inventory.json
          </button>
        }
      />

      <div className="flex flex-wrap items-center gap-2 mb-4">
        {TYPES.map((type) => {
          const meta = TYPE_META[type];
          const off = hidden.has(type);
          return (
            <button
              key={type}
              onClick={() => toggleType(type)}
              className={`flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-semibold border transition-colors ${
                off ? "bg-muted text-muted-foreground border-transparent" : "bg-card text-foreground border-border"
              }`}
              data-testid={`inventory-filter-${type}`}
            >
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: off ? "#CBD5E1" : meta.color }} />
              {meta.label}
            </button>
          );
        })}
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar módulo…"
          className="ml-auto w-56 h-8 rounded-lg border border-border px-3 text-sm focus:outline-none focus:border-primary"
          data-testid="inventory-search"
        />
      </div>

      <div className="flex gap-4">
        <div
          className="flex-1 bg-card rounded-2xl border border-border overflow-hidden relative"
          style={{ height: "70vh" }}
        >
          <svg
            className="w-full h-full cursor-grab active:cursor-grabbing"
            onWheel={onWheel}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onClick={() => setSelected(null)}
            data-testid="inventory-graph"
          >
            <g transform={`translate(${view.tx},${view.ty}) scale(${view.scale})`}>
              {/* edges */}
              {edges.map((e, i) => {
                const a = center(e.from);
                const b = center(e.to);
                if (!a || !b) return null;
                const active = neighborhood?.related.has(e.from) && neighborhood?.related.has(e.to);
                const touchesSel = selected && (e.from === selected || e.to === selected);
                return (
                  <line
                    key={i}
                    x1={a.x}
                    y1={a.y}
                    x2={b.x}
                    y2={b.y}
                    stroke={touchesSel ? "#2563EB" : "#CBD5E1"}
                    strokeWidth={touchesSel ? 1.5 : 0.6}
                    strokeOpacity={selected && !active ? 0.08 : touchesSel ? 0.9 : 0.35}
                  />
                );
              })}
              {/* nodes */}
              {visibleNodes.map((n) => {
                const p = positions.get(n.id);
                if (!p) return null;
                const meta = TYPE_META[n.type] ?? { color: "#94A3B8" };
                const dim = (selected && !neighborhood?.related.has(n.id)) || (queryLc && !matchesQuery(n));
                const isSel = selected === n.id;
                const hit = queryLc.length > 0 && matchesQuery(n);
                return (
                  <g
                    key={n.id}
                    transform={`translate(${p.x},${p.y})`}
                    style={{ cursor: "pointer", opacity: dim ? 0.18 : 1 }}
                    onClick={(ev) => {
                      ev.stopPropagation();
                      setSelected(isSel ? null : n.id);
                    }}
                  >
                    <rect
                      width={NODE_W}
                      height={NODE_H}
                      rx={6}
                      fill={isSel ? meta.color : hit ? "#EFF6FF" : "#FFFFFF"}
                      stroke={isSel || hit ? meta.color : "#E2E8F0"}
                      strokeWidth={isSel || hit ? 2 : 1}
                    />
                    <rect width={4} height={NODE_H} rx={2} fill={meta.color} />
                    <text
                      x={12}
                      y={NODE_H / 2 + 4}
                      fontSize={11}
                      fontWeight={600}
                      fill={isSel ? "#FFFFFF" : "#0F172A"}
                    >
                      {n.label.length > 28 ? n.label.slice(0, 27) + "…" : n.label}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>
          <div className="absolute bottom-3 left-3 flex items-center gap-2 text-xs text-muted-foreground bg-card/80 rounded-lg px-2 py-1">
            <span>Arrastra para mover · rueda para zoom · {Math.round(view.scale * 100)}%</span>
            <button
              onClick={() => setView({ scale: 0.8, tx: 20, ty: 20 })}
              className="text-primary font-semibold hover:underline"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Detail panel */}
        <div className="w-72 flex-shrink-0 bg-card rounded-2xl border border-border p-5 overflow-y-auto" style={{ height: "70vh" }}>
          {selectedNode ? (
            <div className="space-y-4">
              <div>
                <span
                  className="inline-block text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full text-white"
                  style={{ backgroundColor: TYPE_META[selectedNode.type]?.color ?? "#94A3B8" }}
                >
                  {TYPE_META[selectedNode.type]?.label ?? selectedNode.type}
                </span>
                <h3 className="text-sm font-bold text-foreground mt-2">{selectedNode.label}</h3>
                <code className="text-[11px] text-muted-foreground break-all">{selectedNode.path}</code>
              </div>
              <PanelList title={`Usa (${neighborhood?.uses.length ?? 0})`} ids={neighborhood?.uses ?? []} nodes={inventory.nodes} onPick={setSelected} />
              <PanelList title={`Usado por (${neighborhood?.usedBy.length ?? 0})`} ids={neighborhood?.usedBy ?? []} nodes={inventory.nodes} onPick={setSelected} />
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              Haz clic en un módulo para ver sus dependencias y quién lo usa.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PanelList({
  title,
  ids,
  nodes,
  onPick,
}: {
  title: string;
  ids: string[];
  nodes: InventoryNode[];
  onPick: (id: string) => void;
}) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">{title}</p>
      {ids.length === 0 ? (
        <p className="text-xs text-muted-foreground">—</p>
      ) : (
        <div className="space-y-1">
          {ids.map((id) => {
            const n = nodes.find((x) => x.id === id);
            const color = TYPE_META[n?.type ?? ""]?.color ?? "#94A3B8";
            return (
              <button
                key={id}
                onClick={() => onPick(id)}
                className="flex items-center gap-2 w-full text-left text-xs text-muted-foreground hover:text-primary truncate"
              >
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                <span className="truncate">{n?.label ?? id}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
