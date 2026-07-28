"use client";

import Link, { type LinkProps } from "next/link";
import { useParams } from "next/navigation";
import { type AnchorHTMLAttributes, type ReactNode } from "react";
import { defaultLocale } from "@/lib/i18n";

interface LocalizedLinkProps extends Omit<LinkProps, "href">, Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  href: string;
  children?: ReactNode;
}

/** Remplacement direct de next/link : préfixe automatiquement les chemins internes avec la langue courante. */
export default function LocalizedLink({ href, ...props }: LocalizedLinkProps) {
  const params = useParams();
  const lang = typeof params?.lang === "string" ? params.lang : defaultLocale;
  const isInternal = href.startsWith("/") && !href.startsWith("//");
  const localizedHref = isInternal ? `/${lang}${href === "/" ? "" : href}` : href;

  return <Link href={localizedHref} {...props} />;
}
