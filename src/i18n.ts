import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import sw from "./locales/sw.json";

const STORAGE_KEY = "kimuna.lang";

export const LANGS = [
  { code: "en", label: "EN", htmlLang: "en" },
  { code: "sw", label: "SW", htmlLang: "sw" },
] as const;

function detectInitial(): "en" | "sw" {
  if (typeof window === "undefined") return "en";
  const url = new URLSearchParams(window.location.search).get("lang");
  if (url === "sw" || url === "en") return url;
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === "sw" || saved === "en") return saved;
  return "en";
}

const initial = detectInitial();

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    sw: { translation: sw },
  },
  lng: initial,
  fallbackLng: "en",
  interpolation: { escapeValue: false },
  returnEmptyString: false,
});

export function applyLang(lang: string) {
  document.documentElement.lang = lang;
  document.documentElement.setAttribute("data-lang", lang);
  localStorage.setItem(STORAGE_KEY, lang);
  const title =
    lang === "sw"
      ? "KIMUNA — QUALITY WELDING AND METAL SERVICES | Bweyale, Kiryandongo"
      : "KIMUNA — Quality Welding and Metal Services | Bweyale, Kiryandongo";
  document.title = title;
}

applyLang(initial);

export default i18n;
