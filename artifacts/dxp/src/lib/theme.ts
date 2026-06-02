import { useState, useEffect } from "react";

/**
 * Shared dark/light theme control. The theme is a single global concern: the
 * `.dark` class on <html> (read by Tailwind's `dark:` variant) and the persisted
 * `pcl-theme` value. Used by both the public navbar and the admin topbar so they
 * stay in sync.
 */

const STORAGE_KEY = "pcl-theme";

/** Initial dark state: stored preference, else the OS preference. */
export function getInitialDark(): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return stored === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  } catch {
    return false;
  }
}

/** Toggle the `.dark` class on <html> and persist the choice. */
export function applyTheme(dark: boolean) {
  document.documentElement.classList.toggle("dark", dark);
  try {
    localStorage.setItem(STORAGE_KEY, dark ? "dark" : "light");
  } catch {
    /* ignore storage failures (private mode, etc.) */
  }
}

/**
 * Hook returning the current dark state and a `toggle()` that flips it with the
 * brief colour cross-fade (the `theme-transition` class defined in index.css).
 */
export function useDarkMode(): { dark: boolean; toggle: () => void } {
  const [dark, setDark] = useState(getInitialDark);

  useEffect(() => {
    applyTheme(dark);
  }, [dark]);

  const toggle = () => {
    // Enable colour transitions only for the duration of the switch.
    const root = document.documentElement;
    root.classList.add("theme-transition");
    setDark((d) => !d);
    window.setTimeout(() => root.classList.remove("theme-transition"), 400);
  };

  return { dark, toggle };
}
