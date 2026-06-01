import { useAdminStore } from "@/lib/admin-store";
import { translatorSupported } from "@/lib/translate";

/**
 * Reads the auto-translate config from the settings store plus browser support.
 * Lives in its own module (not in AdminUI.tsx) so that file only exports React
 * components — keeping Fast Refresh happy.
 */
export function useAutoTranslate() {
  const settings = useAdminStore((s) => s.settings);
  const at = settings?.autoTranslate ?? { enabled: false, fillEmptyOnBlur: false };
  const supported = translatorSupported();
  return {
    supported,
    enabled: !!at.enabled && supported,
    fillEmptyOnBlur: !!at.fillEmptyOnBlur,
  };
}
