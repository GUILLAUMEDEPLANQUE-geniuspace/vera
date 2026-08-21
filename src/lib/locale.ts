import { useEffect, useState } from "react";

export type Locale = "fr" | "en";

const KEY = "vera-locale";

export function readLocale(): Locale {
  if (typeof window === "undefined") return "fr";
  const v = window.localStorage.getItem(KEY);
  return v === "en" ? "en" : "fr";
}

export function writeLocale(locale: Locale) {
  window.localStorage.setItem(KEY, locale);
  window.dispatchEvent(new Event("vera-locale"));
}

export function useLocale(): [Locale, (l: Locale) => void] {
  const [locale, setLocale] = useState<Locale>("fr");
  useEffect(() => {
    setLocale(readLocale());
    const on = () => setLocale(readLocale());
    window.addEventListener("vera-locale", on);
    window.addEventListener("storage", on);
    return () => {
      window.removeEventListener("vera-locale", on);
      window.removeEventListener("storage", on);
    };
  }, []);
  return [
    locale,
    (l: Locale) => {
      writeLocale(l);
      setLocale(l);
    },
  ];
}

export function t<T extends { fr: string; en: string }>(locale: Locale, row: T): string {
  return locale === "en" ? row.en : row.fr;
}
