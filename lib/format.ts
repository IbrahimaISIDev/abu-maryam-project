import type { Locale } from "@/lib/i18n";

export function formatNoResultsFor(query: string, lang: Locale): string {
  return lang === "ar" ? `لا توجد نتائج لـ « ${query} »` : `Aucun résultat pour « ${query} »`;
}

export function formatDaysAgo(n: number, lang: Locale): string {
  return lang === "ar" ? `منذ ${n} يوم` : `Il y a ${n} jour${n > 1 ? "s" : ""}`;
}

export function formatCoursesCount(n: number, lang: Locale): string {
  return lang === "ar" ? `${n} درس` : `${n} cours`;
}

export function formatCtaParagraph(n: number, lang: Locale): string {
  return lang === "ar"
    ? `${n} درساً مجانياً، متاحة في أي وقت، لتتعلّم بالوتيرة التي تناسبك.`
    : `${n} enseignements gratuits, accessibles à tout moment, pour apprendre à votre rythme.`;
}

export function formatSeminarPlacesRemaining(remaining: number, total: number, lang: Locale): string {
  return lang === "ar" ? `${remaining} من أصل ${total} مكانًا` : `${remaining} places sur ${total}`;
}
