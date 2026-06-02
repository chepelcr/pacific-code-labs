import { create } from "zustand";
import { fetchGitStatus } from "./local-cms";

/**
 * Transient admin-shell UI state (not content):
 *
 * - **Editor registration** — the currently open content page registers whether
 *   it has unsaved edits (`dirty`), how to `save`, and which `filename` it edits.
 *   The nav guard and the floating Save button read this.
 * - **Unsaved-changes nav guard** — when a dirty page tries to navigate away, the
 *   target href is parked in `navTarget` and the confirm modal takes over.
 * - **Publish state** — whether the content dirs have uncommitted changes, so the
 *   topbar can enable/disable the Publish button.
 */
interface AdminUiState {
  // current editor
  dirty: boolean;
  save: (() => Promise<void>) | null;
  filename: string | null;
  setEditor: (e: { dirty: boolean; save: () => Promise<void>; filename: string }) => void;
  clearEditor: () => void;

  // unsaved-changes navigation guard
  navTarget: string | null;
  requestNav: (href: string) => void;
  closeNav: () => void;

  // publish (git working-tree) pending state
  pendingPublish: boolean;
  refreshPublish: () => Promise<void>;
}

export const useAdminUi = /*#__PURE__*/ create<AdminUiState>((set) => ({
  dirty: false,
  save: null,
  filename: null,
  setEditor: ({ dirty, save, filename }) => set({ dirty, save, filename }),
  clearEditor: () => set({ dirty: false, save: null, filename: null }),

  navTarget: null,
  requestNav: (href) => set({ navTarget: href }),
  closeNav: () => set({ navTarget: null }),

  pendingPublish: false,
  refreshPublish: async () => {
    const res = await fetchGitStatus();
    set({ pendingPublish: !!res.pending });
  },
}));

/**
 * For link click handlers: if the open editor has unsaved edits, block the
 * navigation and open the confirm modal instead. Returns true when it handled
 * (blocked) the click so the caller can `preventDefault()`.
 */
export function guardNavigation(href: string): boolean {
  const { dirty, requestNav } = useAdminUi.getState();
  if (dirty) {
    requestNav(href);
    return true;
  }
  return false;
}
