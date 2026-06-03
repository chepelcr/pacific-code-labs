import "@/lib/i18n";
import { createRoot } from "react-dom/client";
import App from "./App";
import { initBrand } from "@/lib/brand-theme";
import "./index.css";

// Apply the active theme's brand palette + favicon from content before render.
initBrand();

createRoot(document.getElementById("root")!).render(<App />);
