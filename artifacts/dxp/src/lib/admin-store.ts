import { create } from "zustand";
import { saveContentFile } from "./local-cms";
import heroData from "../content/hero.json";
import aboutData from "../content/about.json";
import productsData from "../content/products.json";
import servicesData from "../content/services.json";
import caseStudiesData from "../content/caseStudies.json";
import faqData from "../content/faq.json";
import philosophyData from "../content/philosophy.json";
import languagesData from "../content/languages.json";
import navigationData from "../content/navigation.json";
import footerData from "../content/footer.json";
import seoData from "../content/seo.json";
import themesData from "../content/themes.json";
import brandingData from "../content/branding.json";
import mediaData from "../content/media.json";
import legalData from "../content/legal.json";
import settingsData from "../content/settings.json";
import inventoryData from "../content/inventory.json";
import type { MediaLibrary } from "./media";

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  company?: string;
  subject?: string;
  message: string;
  status: "new" | "read" | "archived";
  createdAt: string;
}

interface AdminStore {
  hero: typeof heroData;
  about: typeof aboutData;
  products: typeof productsData;
  services: typeof servicesData;
  caseStudies: typeof caseStudiesData;
  faq: typeof faqData;
  philosophy: typeof philosophyData;
  languages: typeof languagesData;
  navigation: typeof navigationData;
  footer: typeof footerData;
  seo: typeof seoData;
  themes: typeof themesData;
  branding: typeof brandingData;
  media: MediaLibrary;
  legal: typeof legalData;
  settings: typeof settingsData;
  inventory: typeof inventoryData;
  contactMessages: ContactMessage[];

  setHero: (data: typeof heroData) => void;
  setAbout: (data: typeof aboutData) => void;
  setProducts: (data: typeof productsData) => void;
  setServices: (data: typeof servicesData) => void;
  setCaseStudies: (data: typeof caseStudiesData) => void;
  setFaq: (data: typeof faqData) => void;
  setPhilosophy: (data: typeof philosophyData) => void;
  setLanguages: (data: typeof languagesData) => void;
  setNavigation: (data: typeof navigationData) => void;
  setFooter: (data: typeof footerData) => void;
  setSeo: (data: typeof seoData) => void;
  setThemes: (data: typeof themesData) => void;
  setBranding: (data: typeof brandingData) => void;
  setMedia: (data: MediaLibrary) => void;
  setLegal: (data: typeof legalData) => void;
  setSettings: (data: typeof settingsData) => void;
  setInventory: (data: typeof inventoryData) => void;
  addContactMessage: (msg: Omit<ContactMessage, "id" | "createdAt" | "status">) => void;
  updateContactMessage: (id: string, updates: Partial<ContactMessage>) => void;

  /** Serialized last-saved value per content file — the baseline for "dirty". */
  savedSnapshots: Record<string, string>;
  /** Record a file as just saved (its current value is now the baseline). */
  markSaved: (filename: string, data: unknown) => void;
  /** Revert a content entity to its last-saved snapshot (discard edits). */
  discardEntity: (filename: string) => void;
}

/** content filename → the store slice it maps to (for snapshots & discard). */
const ENTITY_BY_FILE: Record<string, keyof AdminStore> = {
  "hero.json": "hero",
  "about.json": "about",
  "products.json": "products",
  "services.json": "services",
  "caseStudies.json": "caseStudies",
  "faq.json": "faq",
  "philosophy.json": "philosophy",
  "languages.json": "languages",
  "navigation.json": "navigation",
  "footer.json": "footer",
  "seo.json": "seo",
  "themes.json": "themes",
  "branding.json": "branding",
  "media.json": "media",
  "legal.json": "legal",
  "settings.json": "settings",
  "inventory.json": "inventory",
};

const INITIAL_SNAPSHOTS: Record<string, string> = {
  "hero.json": JSON.stringify(heroData),
  "about.json": JSON.stringify(aboutData),
  "products.json": JSON.stringify(productsData),
  "services.json": JSON.stringify(servicesData),
  "caseStudies.json": JSON.stringify(caseStudiesData),
  "faq.json": JSON.stringify(faqData),
  "philosophy.json": JSON.stringify(philosophyData),
  "languages.json": JSON.stringify(languagesData),
  "navigation.json": JSON.stringify(navigationData),
  "footer.json": JSON.stringify(footerData),
  "seo.json": JSON.stringify(seoData),
  "themes.json": JSON.stringify(themesData),
  "branding.json": JSON.stringify(brandingData),
  "media.json": JSON.stringify(mediaData),
  "legal.json": JSON.stringify(legalData),
  "settings.json": JSON.stringify(settingsData),
  "inventory.json": JSON.stringify(inventoryData),
};

export const useAdminStore = create<AdminStore>((set) => ({
  hero: heroData,
  about: aboutData,
  products: productsData,
  services: servicesData,
  caseStudies: caseStudiesData,
  faq: faqData,
  philosophy: philosophyData,
  languages: languagesData,
  navigation: navigationData,
  footer: footerData,
  seo: seoData,
  themes: themesData,
  branding: brandingData,
  media: mediaData as MediaLibrary,
  legal: legalData,
  settings: settingsData,
  inventory: inventoryData,
  contactMessages: JSON.parse(localStorage.getItem("pcl-contact-messages") || "[]"),

  setHero: (data) => set({ hero: data }),
  setAbout: (data) => set({ about: data }),
  setProducts: (data) => set({ products: data }),
  setServices: (data) => set({ services: data }),
  setCaseStudies: (data) => set({ caseStudies: data }),
  setFaq: (data) => set({ faq: data }),
  setPhilosophy: (data) => set({ philosophy: data }),
  setLanguages: (data) => set({ languages: data }),
  setNavigation: (data) => set({ navigation: data }),
  setFooter: (data) => set({ footer: data }),
  setSeo: (data) => set({ seo: data }),
  setThemes: (data) => set({ themes: data }),
  setBranding: (data) => set({ branding: data }),
  setMedia: (data) => set({ media: data }),
  setLegal: (data) => set({ legal: data }),
  setSettings: (data) => set({ settings: data }),
  setInventory: (data) => set({ inventory: data }),
  addContactMessage: (msg) =>
    set((state) => {
      const newMsg: ContactMessage = {
        ...msg,
        id: `msg-${Date.now()}`,
        status: "new",
        createdAt: new Date().toISOString(),
      };
      const updated = [newMsg, ...state.contactMessages];
      localStorage.setItem("pcl-contact-messages", JSON.stringify(updated));
      return { contactMessages: updated };
    }),
  updateContactMessage: (id, updates) =>
    set((state) => {
      const updated = state.contactMessages.map((m) =>
        m.id === id ? { ...m, ...updates } : m
      );
      localStorage.setItem("pcl-contact-messages", JSON.stringify(updated));
      return { contactMessages: updated };
    }),

  savedSnapshots: INITIAL_SNAPSHOTS,
  markSaved: (filename, data) =>
    set((state) => ({
      savedSnapshots: { ...state.savedSnapshots, [filename]: JSON.stringify(data) },
    })),
  discardEntity: (filename) => {
    const snap = useAdminStore.getState().savedSnapshots[filename];
    const key = ENTITY_BY_FILE[filename];
    if (snap === undefined || !key) return;
    set({ [key]: JSON.parse(snap) } as Partial<AdminStore>);
  },
}));

/**
 * Whether `value` differs from the last-saved snapshot for `filename`. Works for
 * both editing models: draft pages pass their local draft; pages that mutate the
 * store directly pass the store slice. Re-renders when the snapshot changes
 * (i.e. after a save), so the floating Save button hides itself.
 */
export function useEntityDirty(filename: string, value: unknown): boolean {
  const snap = useAdminStore((s) => s.savedSnapshots[filename]);
  return JSON.stringify(value) !== snap;
}

export async function downloadJson(filename: string, data: unknown) {
  // In local dev, write straight into the repo file (ready to commit). Falls
  // back to a browser download when the write-back endpoint isn't available.
  const wrote = await saveContentFile(filename, data);
  if (wrote) {
    console.info(`[local-cms] saved ${filename} to the repo`);
  } else {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
  // The entity is now clean (matches what's on disk); the working tree has
  // pending changes to publish. Mark the entity clean, and notify the admin
  // shell to re-check publish state — via a DOM event so this module stays free
  // of admin-only imports (admin-store is also pulled into the public bundle by
  // the contact form, and we don't want the admin-ui store leaking there).
  useAdminStore.getState().markSaved(filename, data);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("pcl:content-saved"));
  }
}
