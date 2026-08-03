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

export function formatStartedAgo(min: number, lang: Locale): string {
  return lang === "ar" ? `بث مباشر · بدأ منذ ${min} دقيقة` : `En direct · commencé il y a ${min} min`;
}

export function formatUntilDate(day: number, month: string, lang: Locale): string {
  return lang === "ar" ? `حتى ${day} ${month}` : `jusqu'au ${day} ${month}`;
}

export function formatTrainingDays(n: number, lang: Locale): string {
  return lang === "ar" ? `${n} أيام من التكوين` : `${n} jours de formation`;
}

export function formatClosingOn(date: string, lang: Locale): string {
  // ⁦/⁩ isolent la date (latine) pour éviter que l'algorithme bidi
  // n'inverse l'ordre des mots quand cette chaîne est insérée dans une phrase arabe.
  const isolatedDate = `⁦${date}⁩`;
  return lang === "ar" ? `الإغلاق في ${isolatedDate}` : `Clôture le ${date}`;
}

export function formatLimitedPlaces(n: number, lang: Locale): string {
  return lang === "ar" ? `أماكن محدودة · ${n} متبقية` : `Places limitées · ${n} restantes`;
}

export function formatLibraryCountSummary(n: number, lang: Locale): string {
  return lang === "ar"
    ? `${n} درسًا · تفسير، محاضرات، خطب وسلاسل دروس — تابعها بالوتيرة التي تناسبك.`
    : `${n} enseignements · Tafsir, conférences, khoutbas, séries de cours — à suivre à votre rythme.`;
}

export function formatTabCourses(n: number, lang: Locale): string {
  return lang === "ar" ? `الدروس · ${n}` : `Cours · ${n}`;
}

export function formatTabSeries(n: number, lang: Locale): string {
  return lang === "ar" ? `السلاسل · ${n}` : `Séries · ${n}`;
}

export function formatSortLabel(label: string, lang: Locale): string {
  return lang === "ar" ? `الترتيب: ${label}` : `Trier : ${label}`;
}

export function formatResultsCount(n: number, lang: Locale): string {
  return lang === "ar" ? `${n} نتيجة` : `${n} résultat${n !== 1 ? "s" : ""}`;
}

export function formatMobileAll(n: number, lang: Locale): string {
  return lang === "ar" ? `الكل · ${n}` : `Tout · ${n}`;
}

export function formatPaginationPageLabel(n: number, lang: Locale): string {
  return lang === "ar" ? `الصفحة ${n}` : `Page ${n}`;
}

export function formatSeriesLabel(n: number, lang: Locale): string {
  return lang === "ar" ? `سلسلة · ${n} حلقة` : `Série · ${n} épisodes`;
}

export function formatPlacesFraction(remaining: number, total: number): string {
  return `${remaining} / ${total}`;
}

export function formatAboutCtaParagraph(n: number, lang: Locale): string {
  return lang === "ar"
    ? `${n} درساً مجانياً، متاحة في أي وقت، لترتقي بروحانيتك.`
    : `${n} enseignements gratuits, accessibles à tout moment, pour vous élever spirituellement.`;
}

const themeLabelsAr: Record<string, string> = {
  tafsir: "تفسير",
  tawhid: "توحيد",
  akhlaq: "أخلاق",
  salat: "صلاة",
  famille: "الأسرة",
  sunna: "سنة",
  sahaba: "صحابة",
  khoutba: "خطبة",
  "conférence": "محاضرة",
  rappel: "تذكير",
};

const themeLabelsFr: Record<string, string> = {
  tafsir: "Tafsîr",
  tawhid: "Tawhîd",
  akhlaq: "Akhlâq",
  salat: "Salât",
  famille: "Famille",
  sunna: "Sunna",
  sahaba: "Sahaba",
  khoutba: "Khoutba",
  "conférence": "Conférence",
  rappel: "Rappel",
};

export function formatThemeLabel(theme: string, lang: Locale): string {
  const map = lang === "ar" ? themeLabelsAr : themeLabelsFr;
  return map[theme] ?? theme;
}

export function formatContentLanguage(value: string, lang: Locale): string {
  if (lang === "ar") {
    if (value === "wolof") return "الولوف";
    if (value === "arabe") return "العربية";
    return value;
  }
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function formatDayShort(value: string, lang: Locale): string {
  if (lang === "ar") {
    const map: Record<string, string> = { Ven: "جمعة", Sam: "سبت", Dim: "أحد" };
    return map[value] ?? value;
  }
  return value;
}

export function formatEventCta(label: string, lang: Locale): string {
  if (lang === "ar") {
    const map: Record<string, string> = {
      "S'inscrire": "التسجيل",
      "Regarder en direct": "مشاهدة البث المباشر",
      "Rejoindre": "الانضمام",
      "Voir": "عرض",
    };
    return map[label] ?? label;
  }
  return label;
}

export function formatSocialLabel(id: string, label: string, lang: Locale): string {
  if (lang === "ar" && id === "telegram-group") return "مجموعة تيليجرام";
  if (lang === "ar" && id === "whatsapp") return "مجموعة واتساب";
  return label;
}

export function formatLevel(value: string, lang: Locale): string {
  if (lang === "ar") {
    const map: Record<string, string> = {
      "débutant": "مبتدئ",
      "intermédiaire": "متوسط",
      "avancé": "متقدم",
    };
    return map[value] ?? value;
  }
  return value.charAt(0).toUpperCase() + value.slice(1);
}

const monthsFr = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
const monthsAr = ["يناير", "فبراير", "مارس", "أبريل", "ماي", "يونيو", "يوليو", "أوت", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

function parseIsoDate(iso: string): { day: number; month: number; year: number } {
  const [year, month, day] = iso.split("-").map(Number);
  return { day, month, year };
}

// U+2067 RLI / U+2069 PDI — isolent le nom de mois arabe (RTL) à l'intérieur
// d'une chaîne par ailleurs rendue en dir="ltr", pour empêcher l'algorithme
// bidi de réordonner l'ensemble des jetons (jours, flèche, année) autour de lui.
function isolateRtl(word: string): string {
  return `⁧${word}⁩`;
}

/** Formate une plage de dates (ex. seminar.dateStart → dateEnd), isolée en dir="ltr" par l'appelant. */
export function formatSeminarDateRange(startIso: string, endIso: string, lang: Locale): string {
  const months = lang === "ar" ? monthsAr : monthsFr;
  const start = parseIsoDate(startIso);
  const end = parseIsoDate(endIso);
  const month = (m: number) => (lang === "ar" ? isolateRtl(months[m]) : months[m]);
  if (start.month === end.month && start.year === end.year) {
    return `${String(start.day).padStart(2, "0")} → ${String(end.day).padStart(2, "0")} ${month(end.month - 1)} ${end.year}`;
  }
  return `${String(start.day).padStart(2, "0")} ${month(start.month - 1)} → ${String(end.day).padStart(2, "0")} ${month(end.month - 1)} ${end.year}`;
}

/** Formate une date unique (ex. date limite d'inscription), isolée en dir="ltr" par l'appelant. */
export function formatSeminarSingleDate(iso: string, lang: Locale): string {
  const months = lang === "ar" ? monthsAr : monthsFr;
  const d = parseIsoDate(iso);
  const month = lang === "ar" ? isolateRtl(months[d.month - 1]) : months[d.month - 1];
  return `${String(d.day).padStart(2, "0")} ${month} ${d.year}`;
}

const locationWordsAr: [string, string][] = [
  ["Grande Mosquée de", "الجامع الكبير في"],
  ["Mosquée Al-Aqsa", "مسجد الأقصى"],
  ["Centre Islamique", "المركز الإسلامي"],
  ["En ligne", "عبر الإنترنت"],
];

/** Traduit les mots génériques d'un lieu (Mosquée, Centre Islamique, En ligne…) en gardant les noms de villes tels quels. */
export function formatLocation(location: string, lang: Locale): string {
  if (lang !== "ar") return location;
  let result = location;
  for (const [fr, ar] of locationWordsAr) {
    result = result.replace(fr, ar);
  }
  return result;
}
