import type { Locale } from "@/lib/i18n";
import type { Teaching, Series, LiveStatus, Replay, ScheduleItem, Seminar } from "@/lib/types";

interface TeachingAr {
  title: string;
  description?: string;
  chapters?: string[];
}

// Traductions arabes du contenu réel (enseignements, séries, direct, événements).
// Clé = id de l'élément en français ; ne couvre que les champs traduisibles
// (les données structurelles — durée, thème, dates — restent la source unique de vérité).
const teachingsAr: Record<string, TeachingAr> = {
  "1": {
    title: "سورة الكهف — نور يوم الجمعة (الحلقة 1)",
    description:
      "الحلقة الأولى من تفسير سورة الكهف. نتناول الآيات الافتتاحية والعبر المستفادة حول الثبات على الإيمان عند الابتلاءات.",
    chapters: ["مقدمة", "تلاوة الآيات الافتتاحية", "شرح آية آية", "أسئلة وأجوبة"],
  },
  "2": {
    title: "رسالة إلى حفظة القرآن",
    description: "خطبة جمعة حول مسؤولية حفظة القرآن ودورهم في المجتمع.",
  },
  "3": {
    title: "معجزة القرآن — الأدلة واليقين",
    description: "محاضرة حول إعجاز القرآن — اللغوي والعلمي والروحي.",
  },
  "4": {
    title: "أركان الإسلام — السلسلة الكاملة",
    description: "عرض شامل للأركان الخمسة مع شروطها وحِكَمها، للمبتدئين والمتقدمين.",
  },
  "5": {
    title: "حياة الصحابة — أبو بكر الصديق (الحلقة 1)",
    description:
      "الدرس الأول من سلسلة الصحابة. سيرة أبي بكر الصديق، أول الخلفاء الراشدين وأقرب أصحاب النبي ﷺ.",
  },
  "6": {
    title: "جمال الصلاة — الوقوف بين يدي الله",
    description:
      "كيف تتحول الصلاة من مجرد واجب إلى لقاء روحي حقيقي مع الله. نصائح عملية وسمو بالقلب.",
  },
  "7": {
    title: "الأخلاق — مكارم الأخلاق في الإسلام",
    description:
      "أسس الأخلاق الإسلامية: الصدق، الكرم، الصبر، الحياء — تعاليم مستمدة من القرآن والسنة.",
  },
  "8": {
    title: "الأسرة على منهج السنة",
    description:
      "الأدوار والمسؤوليات داخل الأسرة المسلمة وفق النصوص الصحيحة — حقوق الزوجين، تربية الأبناء.",
  },
  "9": {
    title: "التوحيد — معرفة الله (الحلقة 1)",
    description:
      "الحلقة الأولى من سلسلة أصول التوحيد. أسماء الله وصفاته وفق فهم السلف.",
    chapters: ["مقدمة", "أسماء الله", "الصفات الإلهية", "خاتمة"],
  },
  "10": {
    title: "سورة الكهف — أصحاب الكهف (الحلقة 2)",
    description:
      "الحلقة الثانية: قصة أصحاب الكهف، دلالتها والعبر المستفادة حول الثبات على الإيمان أمام الظلم.",
  },
  "11": {
    title: "الدعوة إلى التوحيد الخالص",
    description: "خطبة حول أهمية تنقية العقيدة من كل ما يخالف التوحيد.",
  },
  "12": {
    title: "الثبات على السنة",
    description:
      "كيف تبقى ثابتًا على السنة في أوقات الشك والضغط الاجتماعي. نصائح عملية وطمأنينة روحية.",
  },
};

const seriesAr: Record<string, { title: string; description: string }> = {
  "tafsir-al-kahf": {
    title: "تفسير سورة الكهف",
    description:
      "شرح كامل لسورة الكهف آية آية، مع الفوائد المستخلصة من كل مقطع.",
  },
  "usul-tawhid": {
    title: "أصول التوحيد",
    description:
      "سلسلة تمهيدية لمعرفة الله — الأسماء والصفات والوحدانية وفق النصوص الصحيحة.",
  },
  "hayatu-sahaba": {
    title: "حياة الصحابة",
    description:
      "سِيَر الصحابة رضي الله عنهم — فضائلهم وتضحياتهم وعِبَرهم لزماننا.",
  },
};

const liveStatusAr = {
  title: "درس المساء — مكانة الله في قلوبنا",
  description:
    "درس مسائي حول ضرورة ترسيخ محبة الله في قلوبنا، بالاستناد إلى القرآن وتعاليم السنة الصحيحة.",
};

const replaysAr: Record<string, string> = {
  r1: "تفسير سورة قاف",
  r2: "الدعوة إلى التوحيد الخالص",
  r3: "الثبات على السنة",
};

const scheduleAr: Record<string, { title: string; subtitle: string }> = {
  Ven: { title: "خطبة الجمعة", subtitle: "خطبة أسبوعية" },
  Sam: { title: "تفسير — سورة يس", subtitle: "سلسلة أسبوعية" },
  Dim: { title: "حياة الصحابة", subtitle: "سيرة الصحابة" },
};

const seminarAr = {
  label: "ندوة تكوينية للفتيات",
  labelShort: "ندوة الفتيات",
  title: "كُنَّ نساءً موهوبات لله",
  description:
    "أسبوع من التكوين والتربية الروحية والأخوة للفتيات — دروس وورشات ومرافقة.",
  priceNote: "إمكانية الدفع على 3 دفعات",
  perks: ["دروس يومية مؤطرة", "دعامات ومسجلات عبر الإنترنت", "متابعة ومرافقة"],
  targetAudience: "مخصص للفتيات · ابتداءً من 14 سنة",
};

const agendaItemsAr: Record<string, string> = {
  a1: "كُنَّ نساءً موهوبات لله",
  a2: "خطبة الجمعة",
  a3: "تفسير — سورة يس (سلسلة)",
  a4: "الأسرة على منهج السنة",
  a5: "سورة البقرة — دورة شهرية",
  a6: "أصول التوحيد",
};

export function getTeachingTitle(teaching: Teaching, lang: Locale): string {
  if (lang === "ar") {
    if (teaching.titleAr && teaching.titleAr.trim() !== "") {
      return teaching.titleAr;
    }
    return teachingsAr[teaching.id]?.title ?? teaching.title;
  }
  return teaching.title;
}

export function getTeachingDescription(teaching: Teaching, lang: Locale): string | undefined {
  if (lang === "ar") {
    if (teaching.descriptionAr && teaching.descriptionAr.trim() !== "") {
      return teaching.descriptionAr;
    }
    return teachingsAr[teaching.id]?.description ?? teaching.description;
  }
  return teaching.description;
}

export function getChapterLabel(teaching: Teaching, index: number, lang: Locale, fallback: string): string {
  if (lang === "ar") return teachingsAr[teaching.id]?.chapters?.[index] ?? fallback;
  return fallback;
}

export function getSeriesTitle(series: Series, lang: Locale): string {
  return lang === "ar" ? seriesAr[series.id]?.title ?? series.title : series.title;
}

export function getSeriesDescription(series: Series, lang: Locale): string {
  return lang === "ar" ? seriesAr[series.id]?.description ?? series.description : series.description;
}

export function getLiveStatusTitle(status: LiveStatus, lang: Locale): string {
  return lang === "ar" ? liveStatusAr.title : status.title;
}

export function getLiveStatusDescription(status: LiveStatus, lang: Locale): string {
  return lang === "ar" ? liveStatusAr.description : status.description;
}

export function getReplayTitle(replay: Replay, lang: Locale): string {
  return lang === "ar" ? replaysAr[replay.id] ?? replay.title : replay.title;
}

export function getScheduleTitle(item: ScheduleItem, lang: Locale): string {
  return lang === "ar" ? scheduleAr[item.dayShort]?.title ?? item.title : item.title;
}

export function getScheduleSubtitle(item: ScheduleItem, lang: Locale): string {
  return lang === "ar" ? scheduleAr[item.dayShort]?.subtitle ?? item.subtitle : item.subtitle;
}

type SeminarStringField = "label" | "labelShort" | "title" | "description" | "priceNote" | "targetAudience";

export function getSeminarField(seminar: Seminar, field: SeminarStringField, lang: Locale): string {
  return lang === "ar" ? seminarAr[field] : (seminar[field] ?? "");
}

export function getSeminarPerks(seminar: Seminar, lang: Locale): string[] {
  return lang === "ar" ? seminarAr.perks : seminar.perks ?? [];
}

export function getAgendaItemTitle(id: string, title: string, lang: Locale): string {
  return lang === "ar" ? agendaItemsAr[id] ?? title : title;
}
