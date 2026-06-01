import { createContext, useContext, useState, type ReactNode } from "react";

export type EditLang = "es" | "en";

interface AdminLangValue {
  lang: EditLang;
  setLang: (l: EditLang) => void;
}

const AdminLangContext = createContext<AdminLangValue | null>(null);

/**
 * Shared "editing language" for the admin dashboard. A single toggle (rendered
 * via <LangToggle/>) drives which language's fields every content page shows,
 * so the choice is consistent across pages. Persisted in localStorage.
 */
export function AdminLangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<EditLang>(
    () => ((localStorage.getItem("pcl-admin-lang") as EditLang) ?? "es"),
  );
  const setLang = (l: EditLang) => {
    setLangState(l);
    localStorage.setItem("pcl-admin-lang", l);
  };
  return (
    <AdminLangContext.Provider value={{ lang, setLang }}>{children}</AdminLangContext.Provider>
  );
}

export function useAdminLang(): AdminLangValue {
  const ctx = useContext(AdminLangContext);
  if (!ctx) throw new Error("useAdminLang must be used inside AdminLangProvider");
  return ctx;
}
