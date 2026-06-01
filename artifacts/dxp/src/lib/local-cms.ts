/**
 * Client helpers that talk to the dev-only write-back middleware
 * (see `vite-plugin-local-cms.ts`). When running the local dev server, admin
 * edits are written straight into the repo's source files so they can be
 * committed. In any non-dev build these are no-ops (return false), and callers
 * fall back to a browser download.
 */

/** True when the local write-back endpoints are available (vite dev). */
export const LOCAL_CMS_ENABLED = import.meta.env.DEV;

/** Write a content/translation JSON file into the repo. Returns true on success. */
export async function saveContentFile(filename: string, data: unknown): Promise<boolean> {
  if (!LOCAL_CMS_ENABLED) return false;
  try {
    const res = await fetch("/__local/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename, data }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Write an image asset (data URL) into the repo's public/ folder. */
export async function uploadAsset(filename: string, dataUrl: string): Promise<boolean> {
  if (!LOCAL_CMS_ENABLED) return false;
  try {
    const res = await fetch("/__local/asset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename, dataUrl }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
