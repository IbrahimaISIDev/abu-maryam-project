export const glossary: Record<string, string> = {
  tafsir: "Exégèse et explication du sens des versets du Coran.",
  tawhid: "L'unicité d'Allah — le fondement central de la foi islamique.",
  akhlaq: "Les mœurs et le comportement éthique en Islam.",
  salat: "La prière rituelle, l'un des cinq piliers de l'Islam.",
  famille: "L'organisation et les droits/devoirs au sein du foyer selon les textes islamiques.",
  sunna: "Les paroles, actes et approbations du Prophète Muhammad ﷺ.",
  sahaba: "Les Compagnons du Prophète Muhammad ﷺ.",
  khoutba: "Le sermon prononcé lors de la prière du vendredi.",
  "conférence": "Une intervention publique sur un thème islamique, hors cadre du sermon.",
  salaf: "Les pieux prédécesseurs des trois premières générations de l'Islam.",
  "da'wah": "L'appel et l'invitation à l'Islam.",
  oustaz: "Titre respectueux désignant un enseignant ou un prédicateur religieux.",
};

export type GlossaryKey = keyof typeof glossary;
