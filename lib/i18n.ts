export const locales = ["fr", "ar"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "fr";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function otherLocale(locale: Locale): Locale {
  return locale === "fr" ? "ar" : "fr";
}

export const localeDir: Record<Locale, "ltr" | "rtl"> = {
  fr: "ltr",
  ar: "rtl",
};

/** Remplace le préfixe de langue d'un chemin par une autre langue, en conservant le reste du chemin et la query string. */
export function switchLocalePath(pathname: string, search: string, target: Locale): string {
  const segments = pathname.split("/");
  // segments[0] est toujours "" (le chemin commence par /), segments[1] est la langue actuelle
  segments[1] = target;
  return segments.join("/") + search;
}
