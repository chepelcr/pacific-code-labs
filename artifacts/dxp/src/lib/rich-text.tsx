import { Fragment, type ReactNode } from "react";

/**
 * Lightweight rich-text for editable content (mirrors the pos-landing
 * `parseTitle` approach). Editors type a simple syntax in the JSON/admin and
 * it renders to styled React nodes — no HTML, no XSS surface.
 *
 * Syntax:
 *   \n          → line break (type a literal backslash-n)
 *   {{text}}    → brand gradient highlight (Tech Blue → Electric Cyan)
 *   [[text]]    → Electric Cyan
 *   ((text))    → Emerald
 *   <<text>>    → Amber
 *   **text**    → bold
 *
 * Plain text with none of the above renders unchanged, so it's safe to apply
 * everywhere.
 */

type Style = "gradient" | "cyan" | "emerald" | "amber" | "bold";

const STYLE_CLASS: Record<Style, string> = {
  gradient:
    "text-transparent bg-clip-text bg-gradient-to-r from-[#2563EB] to-[#06B6D4]",
  cyan: "text-[#06B6D4]",
  emerald: "text-[#10B981]",
  amber: "text-[#F59E0B]",
  bold: "font-bold",
};

const PATTERNS: Array<{ regex: RegExp; style: Style }> = [
  { regex: /\{\{([^}]+)\}\}/g, style: "gradient" },
  { regex: /\[\[([^\]]+)\]\]/g, style: "cyan" },
  { regex: /\(\(([^)]+)\)\)/g, style: "emerald" },
  { regex: /<<([^>]+)>>/g, style: "amber" },
  { regex: /\*\*([^*]+)\*\*/g, style: "bold" },
];

function renderLine(line: string, keyPrefix: string): ReactNode[] {
  const matches: Array<{ index: number; length: number; text: string; style: Style }> = [];
  for (const { regex, style } of PATTERNS) {
    for (const m of line.matchAll(regex)) {
      if (m.index !== undefined) {
        matches.push({ index: m.index, length: m[0].length, text: m[1], style });
      }
    }
  }
  matches.sort((a, b) => a.index - b.index);

  const out: ReactNode[] = [];
  let cursor = 0;
  matches.forEach((m, i) => {
    if (m.index < cursor) return; // skip overlapping matches
    if (m.index > cursor) out.push(line.slice(cursor, m.index));
    out.push(
      <span key={`${keyPrefix}-${i}`} className={STYLE_CLASS[m.style]}>
        {m.text}
      </span>,
    );
    cursor = m.index + m.length;
  });
  if (cursor < line.length) out.push(line.slice(cursor));
  return out;
}

/** Parse the rich-text syntax into React nodes. */
export function parseRichText(value: string): ReactNode {
  if (!value) return value;
  const lines = value.split("\\n");
  return lines.map((line, i) => (
    <Fragment key={i}>
      {renderLine(line, String(i))}
      {i < lines.length - 1 && <br />}
    </Fragment>
  ));
}

/** Convenience renderer. */
export function RichText({ children }: { children: string }) {
  return <>{parseRichText(children)}</>;
}

/** One-line reminder shown under admin fields that support the syntax. */
export const RICH_TEXT_HINT =
  "Formato: \\n salto de línea · {{degradado}} · [[cian]] · ((verde)) · <<ámbar>> · **negrita**";
