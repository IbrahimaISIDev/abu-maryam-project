import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "@/lib/adminAuth";
import { locales, defaultLocale } from "@/lib/i18n";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // --- Back-office : comportement inchangé, jamais préfixé par une langue ---
  if (pathname === "/admin/login" || pathname.startsWith("/api/admin/")) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    const session = request.cookies.get(ADMIN_COOKIE_NAME);
    if (!verifySessionToken(session?.value)) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // --- Site public : redirige vers /fr ou /ar si la langue est absente du chemin ---
  const hasLocale = locales.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
  if (hasLocale) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = `/${defaultLocale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    // Exclut les routes API/Next.js internes, les routes d'icônes générées (sans extension
    // dans le chemin, le content-type étant fixé via les en-têtes) et tout chemin de fichier
    // statique — reconnu ici par la présence d'une extension, pour ne pas avoir à lister
    // chaque asset de public/ un par un (images/, sw.js, favicon.ico, etc.).
    "/((?!api|_next/static|_next/image|icon|apple-icon|pwa-icon|.*\\..*).*)",
  ],
};
