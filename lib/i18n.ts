export const locales = ["fr", "ar"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "fr";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://abou-maryam.com";

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

/**
 * Construit les alternates hreflang d'une page à partir de la langue courante et de son
 * chemin SANS préfixe de langue (ex. "/bibliotheque", "" pour l'accueil). Utilisé dans
 * generateMetadata — chaque page connaît son propre chemin statique, ce qui évite de
 * dépendre de headers()/pathname (qui forcerait un rendu dynamique et casserait la
 * génération statique du site).
 */
export function buildLanguageAlternates(lang: Locale, path: string): { canonical: string; languages: Record<Locale, string> } {
  const suffix = path ? (path.startsWith("/") ? path : `/${path}`) : "";
  const languages = Object.fromEntries(locales.map((l) => [l, `/${l}${suffix}`])) as Record<Locale, string>;
  return { canonical: languages[lang], languages };
}
