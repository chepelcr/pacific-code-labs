import { Fragment, type ReactNode } from "react";

/**
 * Lightweight rich-text for editable content (mirrors the pos-landing
 * `parseTitle` approach). Editors type a simple syntax in the JSON/admin and
 * it renders to styled React nodes — no HTML, no XSS surface.
 *
 * Syntax (markers nest, so styles combine):
 *   \n            → line break (type a literal backslash-n)
 *   {{text}}      → brand gradient highlight (Tech Blue → Electric Cyan)
 *   [[text]]      → Electric Cyan
 *   ((text))      → Emerald
 *   <<text>>      → Amber
 *   **text**      → bold
 *   [[**text**]]  → cyan AND bold (any combination nests)
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

// Non-global regexes: each `.exec` returns the first match from the start, so
// we can scan recursively without lastIndex bookkeeping.
const PATTERNS: Array<{ regex: RegExp; style: Style }> = [
  { regex: /\{\{([\s\S]+?)\}\}/, style: "gradient" },
  { regex: /\[\[([\s\S]+?)\]\]/, style: "cyan" },
  { regex: /\(\(([\s\S]+?)\)\)/, style: "emerald" },
  { regex: /<<([\s\S]+?)>>/, style: "amber" },
  { regex: /\*\*([\s\S]+?)\*\*/, style: "bold" },
];

/**
 * Recursively tokenise a line: find the earliest-starting marker, emit the text
 * before it, then a styled <span> whose children are the *parsed* inner text
 * (so markers nest and styles combine), then continue after the marker.
 */
function renderLine(line: string, keyPrefix: string): ReactNode[] {
  let best: { index: number; length: number; text: string; style: Style } | null = null;
  for (const { regex, style } of PATTERNS) {
    const m = regex.exec(line);
    if (m && m.index !== undefined && (best === null || m.index < best.index)) {
      best = { index: m.index, length: m[0].length, text: m[1], style };
    }
  }

  if (!best) return line ? [line] : [];

  const out: ReactNode[] = [];
  if (best.index > 0) out.push(line.slice(0, best.index));
  out.push(
    <span key={keyPrefix} className={STYLE_CLASS[best.style]}>
      {renderLine(best.text, `${keyPrefix}i`)}
    </span>,
  );
  const rest = line.slice(best.index + best.length);
  if (rest) out.push(...renderLine(rest, `${keyPrefix}r`));
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
  "Formato: \\n salto de línea · {{degradado}} · [[cian]] · ((verde)) · <<ámbar>> · **negrita** · se combinan: [[**cian y negrita**]]";
