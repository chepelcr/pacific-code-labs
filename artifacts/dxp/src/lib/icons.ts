import type { ComponentType } from "react";
import {
  Code2,
  BrainCircuit,
  Workflow,
  Cloud,
  Headphones,
  Bird,
  Flame,
  Boxes,
  Rocket,
  ShieldCheck,
  Cpu,
  Database,
  Globe,
  Sparkles,
  Zap,
  LayoutGrid,
} from "lucide-react";

export type IconComponent = ComponentType<{
  className?: string;
  style?: React.CSSProperties;
}>;

/**
 * Registry of icons selectable from content/admin (e.g. `service.iconName`,
 * `product.iconName`). Keep this the single source of truth so the editable
 * `iconName` field stays in sync with what the public site can render.
 */
export const ICONS: Record<string, IconComponent> = {
  Code2,
  BrainCircuit,
  Workflow,
  Cloud,
  Headphones,
  Bird,
  Flame,
  Boxes,
  Rocket,
  ShieldCheck,
  Cpu,
  Database,
  Globe,
  Sparkles,
  Zap,
  LayoutGrid,
};

/** Valid icon names, handy for admin <select> dropdowns. */
export const ICON_NAMES = Object.keys(ICONS);

/** Resolve an icon name to a component, falling back to a sensible default. */
export function resolveIcon(name: string | null | undefined, fallback: IconComponent = Code2): IconComponent {
  return (name && ICONS[name]) || fallback;
}
