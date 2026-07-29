/**
 * Script de seed — insère les données mock actuelles (data/*.ts) dans Postgres
 * pour que le site continue de fonctionner pendant la transition.
 * Lancer avec : npm run db:seed
 */
import { db } from "./client";
import {
  series,
  teachings,
  agendaItems,
  liveStatus,
  seminars,
  replays,
  registrations,
} from "./schema";

async function main() {
  console.log("Seed — séries...");
  await db.insert(series).values([
    {
      id: "tafsir-al-kahf",
      title: "Tafsir Sourate Al-Kahf",
      description:
        "Explication complète de la sourate Al-Kahf verset par verset, avec les enseignements tirés de chaque passage.",
      theme: "tafsir",
      language: "wolof",
      totalEpisodes: 4,
      arabicVerse: "وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا",
    },
    {
      id: "usul-tawhid",
      title: "Fondements du Tawhîd",
      description:
        "Série d'introduction à la connaissance d'Allah — les noms, attributs et unicité divine selon les textes authentiques.",
      theme: "tawhid",
      language: "arabe",
      totalEpisodes: 3,
      arabicVerse: "قُلْ هُوَ اللَّهُ أَحَدٌ",
    },
    {
      id: "hayatu-sahaba",
      title: "Hayâtu Sahaba",
      description:
        "Vie et biographies des Compagnons du Prophète — leurs vertus, sacrifices et enseignements pour aujourd'hui.",
      theme: "sahaba",
      language: "wolof",
      totalEpisodes: 3,
    },
  ]).onConflictDoNothing();

  console.log("Seed — enseignements...");
  await db.insert(teachings).values([
    {
      id: "1",
      title: "Sourate Al-Kahf — la lumière du vendredi (Épisode 1)",
      type: "video",
      theme: "tafsir",
      language: "wolof",
      duration: "1:12:04",
      durationSeconds: 4324,
      publishedAt: new Date("2026-07-11"),
      description:
        "Premier épisode du Tafsir de Sourate Al-Kahf. Nous abordons les versets d'ouverture et les leçons sur la fermeté dans la foi face aux épreuves.",
      seriesId: "tafsir-al-kahf",
      episodeNumber: 1,
      level: "intermédiaire",
      arabicVerse: "الْحَمْدُ لِلَّهِ الَّذِي أَنزَلَ عَلَىٰ عَبْدِهِ الْكِتَابَ",
      chapters: [
        { label: "Introduction", timeSeconds: 0 },
        { label: "Lecture des versets d'ouverture", timeSeconds: 360 },
        { label: "Explication verset par verset", timeSeconds: 1200 },
        { label: "Questions & réponses", timeSeconds: 3600 },
      ],
    },
    {
      id: "2",
      title: "Message aux gardiens du Coran",
      type: "audio",
      theme: "khoutba",
      language: "wolof",
      duration: "42:43",
      durationSeconds: 2563,
      publishedAt: new Date("2026-07-04"),
      description:
        "Khoutba du vendredi sur la responsabilité de ceux qui mémorisent le Coran et leur rôle dans la communauté.",
      level: "débutant",
      arabicVerse: "إِنَّا نَحْنُ نَزَّلْنَا الذِّكْرَ وَإِنَّا لَهُ لَحَافِظُونَ",
    },
    {
      id: "3",
      title: "Le miracle du Coran — preuves et certitudes",
      type: "video",
      theme: "tafsir",
      language: "wolof",
      duration: "54:12",
      durationSeconds: 3252,
      publishedAt: new Date("2026-06-28"),
      description: "Conférence sur l'inimitabilité du Coran (i'jaz) — linguistique, scientifique et spirituelle.",
      level: "débutant",
    },
    {
      id: "4",
      title: "Les piliers de l'Islam — série complète",
      type: "video",
      theme: "tawhid",
      language: "wolof",
      duration: "58:30",
      durationSeconds: 3510,
      publishedAt: new Date("2026-06-20"),
      description:
        "Présentation complète des cinq piliers avec leurs conditions et leurs sagesses, pour débutants et confirmés.",
      level: "débutant",
    },
    {
      id: "5",
      title: "Hayâtu Sahaba — Abou Bakr As-Siddîq (Épisode 1)",
      type: "audio",
      theme: "sahaba",
      language: "wolof",
      duration: "1:05:18",
      durationSeconds: 3918,
      publishedAt: new Date("2026-06-14"),
      description:
        "Première leçon de la série sur les Compagnons. Portrait d'Abou Bakr As-Siddîq, premier calife et plus proche ami du Prophète.",
      seriesId: "hayatu-sahaba",
      episodeNumber: 1,
      level: "intermédiaire",
    },
    {
      id: "6",
      title: "La beauté de la Salât — se tenir devant Allah",
      type: "video",
      theme: "salat",
      language: "wolof",
      duration: "47:22",
      durationSeconds: 2842,
      publishedAt: new Date("2026-06-07"),
      description:
        "Comment transformer la prière d'une obligation en véritable rencontre spirituelle avec Allah. Conseils pratiques et élévation du cœur.",
      level: "débutant",
      arabicVerse: "وَأَقِيمُوا الصَّلَاةَ وَآتُوا الزَّكَاةَ",
    },
    {
      id: "7",
      title: "Akhlâq — les bonnes mœurs en Islam",
      type: "video",
      theme: "akhlaq",
      language: "wolof",
      duration: "39:55",
      durationSeconds: 2395,
      publishedAt: new Date("2026-05-30"),
      description:
        "Les fondements de l'éthique islamique : vérité, générosité, patience, pudeur — enseignements tirés du Qur'an et de la Sunna.",
      level: "débutant",
    },
    {
      id: "8",
      title: "La famille selon la Sunna",
      type: "audio",
      theme: "famille",
      language: "wolof",
      duration: "52:10",
      durationSeconds: 3130,
      publishedAt: new Date("2026-05-23"),
      description:
        "Rôles et responsabilités au sein de la famille musulmane selon les textes authentiques — droits des époux, éducation des enfants.",
      level: "intermédiaire",
    },
    {
      id: "9",
      title: "Tawhîd — connaissance d'Allah (Épisode 1)",
      type: "video",
      theme: "tawhid",
      language: "arabe",
      duration: "1:22:40",
      durationSeconds: 4960,
      publishedAt: new Date("2026-05-16"),
      description:
        "Premier épisode de la série sur les fondements du Tawhîd. Les noms et attributs d'Allah selon la compréhension des Salaf.",
      seriesId: "usul-tawhid",
      episodeNumber: 1,
      level: "avancé",
      arabicVerse: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ",
      chapters: [
        { label: "Introduction", timeSeconds: 0 },
        { label: "Les noms d'Allah", timeSeconds: 480 },
        { label: "Les attributs divins", timeSeconds: 1800 },
        { label: "Conclusion", timeSeconds: 4500 },
      ],
    },
    {
      id: "10",
      title: "Sourate Al-Kahf — les gens de la caverne (Épisode 2)",
      type: "video",
      theme: "tafsir",
      language: "wolof",
      duration: "1:08:45",
      durationSeconds: 4125,
      publishedAt: new Date("2026-05-09"),
      description:
        "Deuxième épisode : l'histoire des gens de la caverne, sa signification et les leçons sur la foi face à l'oppression.",
      seriesId: "tafsir-al-kahf",
      episodeNumber: 2,
      level: "intermédiaire",
    },
    {
      id: "11",
      title: "L'appel au Tawhîd pur",
      type: "audio",
      theme: "tawhid",
      language: "wolof",
      duration: "35:48",
      durationSeconds: 2148,
      publishedAt: new Date("2026-05-02"),
      description: "Khoutba sur l'importance de purifier sa foi de tout ce qui contredit le Tawhîd.",
      level: "débutant",
    },
    {
      id: "12",
      title: "La persévérance dans la Sunna",
      type: "video",
      theme: "sunna",
      language: "arabe",
      duration: "44:15",
      durationSeconds: 2655,
      publishedAt: new Date("2026-04-25"),
      description:
        "Comment rester ferme sur la Sunna en période de doute et de pression sociale. Conseils pratiques et réconfort spirituel.",
      level: "intermédiaire",
    },
  ]).onConflictDoNothing();

  console.log("Seed — replays...");
  await db.insert(replays).values([
    { id: "r1", title: "Tafsir Sourate Qâf", createdAt: new Date(Date.now() - 2 * 86400_000) },
    { id: "r2", title: "L'appel au Tawhîd pur", createdAt: new Date(Date.now() - 5 * 86400_000) },
    { id: "r3", title: "La persévérance dans la Sunna", createdAt: new Date(Date.now() - 7 * 86400_000) },
  ]).onConflictDoNothing();

  console.log("Seed — statut live...");
  await db.insert(liveStatus).values({
    id: "singleton",
    isLive: true,
    title: "Dars du soir — La place d'Allah dans nos cœurs",
    arabicVerse: "مكانة الله في قلوبنا",
    viewers: 1248,
    streamUrl: null,
    youtubeChannelId: "UCiMv6OE5QEAZsGVaqJUuhYg",
    startedAt: new Date("2026-07-15T20:30:00"),
    hostName: "Oustaz Niang Mbaye (H.A)",
    description:
      "Une leçon du soir sur la nécessité d'ancrer l'amour d'Allah au cœur de nos vies, en s'appuyant sur le Qur'an et les enseignements authentiques de la Sunna.",
  }).onConflictDoNothing();

  console.log("Seed — séminaire...");
  await db.insert(seminars).values({
    id: "seminaire-jeunes-filles-2026",
    arabicVerse: "كوني لله كما يحب",
    edition: "4e édition",
    label: "Séminaire de formation des jeunes filles",
    labelShort: "Séminaire jeunes filles",
    title: "Devenez des Femmes vouées à Allah",
    description:
      "Une semaine de formation, d'éducation spirituelle et de fraternité pour les jeunes filles — cours, ateliers et accompagnement.",
    dateStart: new Date("2026-08-08"),
    dateEnd: new Date("2026-08-15"),
    registrationDeadline: new Date("2026-07-20"),
    location: "Diender",
    price: "45 000 F CFA",
    priceNote: "Paiement possible en 3 tranches",
    contactPhone: "78 561 70 70",
    contactPhoneNote: "Wave / Orange Money",
    contactEmail: "orphelinsdiender@gmail.com",
    totalPlaces: 120,
    remainingPlaces: 37,
    perks: [
      "Cours quotidiens encadrés",
      "Supports & replays en ligne",
      "Suivi et accompagnement",
    ],
    targetAudience: "Réservé aux jeunes filles · à partir de 14 ans",
  }).onConflictDoNothing();

  console.log("Seed — agenda...");
  await db.insert(agendaItems).values([
    {
      id: "a1",
      type: "séminaire",
      title: "Devenez des Femmes vouées à Allah",
      location: "Diender",
      dateStart: new Date("2026-08-08"),
      dateEnd: new Date("2026-08-15"),
      registrationDeadline: new Date("2026-07-20"),
      totalPlaces: 120,
      remainingPlaces: 37,
      isFeatured: true,
      ctaLabel: "S'inscrire",
    },
    {
      id: "a2",
      type: "khoutba",
      title: "Khoutba du Vendredi",
      location: "Mosquée Al-Aqsa, Dakar",
      dateStart: new Date("2026-07-18"),
      isFeatured: false,
      ctaLabel: "Regarder en direct",
    },
    {
      id: "a3",
      type: "cours",
      title: "Tafsir — Sourate Yâ-Sîn (série)",
      location: "En ligne",
      dateStart: new Date("2026-07-19"),
      isFeatured: false,
      ctaLabel: "Rejoindre",
    },
    {
      id: "a4",
      type: "conférence",
      title: "La famille selon la Sunna",
      location: "Centre Islamique, Thiès",
      dateStart: new Date("2026-07-26"),
      isFeatured: false,
      ctaLabel: "Voir",
    },
    {
      id: "a5",
      type: "tafsir",
      title: "Sourate Al-Baqara — Cycle mensuel",
      location: "En ligne",
      dateStart: new Date("2026-06-20"),
      isFeatured: false,
    },
    {
      id: "a6",
      type: "conférence",
      title: "Les fondements du Tawhîd",
      location: "Grande Mosquée de Dakar",
      dateStart: new Date("2026-05-15"),
      isFeatured: false,
    },
  ]).onConflictDoNothing();

  console.log("Seed — inscriptions...");
  await db.insert(registrations).values([
    { id: "reg-01", fullName: "Ousmane Diallo", email: "o.diallo@gmail.com", phone: "+221 77 123 45 67", city: "Dakar", registeredAt: new Date("2026-06-10T09:15:00Z"), status: "confirmed", paymentStatus: "paid" },
    { id: "reg-02", fullName: "Fatou Mbaye", email: "fatou.mbaye@yahoo.fr", phone: "+221 76 234 56 78", city: "Thiès", registeredAt: new Date("2026-06-11T14:22:00Z"), status: "confirmed", paymentStatus: "paid" },
    { id: "reg-03", fullName: "Ibrahima Sow", email: "ibra.sow@gmail.com", phone: "+221 70 345 67 89", city: "Saint-Louis", registeredAt: new Date("2026-06-12T08:40:00Z"), status: "pending", paymentStatus: "unpaid" },
    { id: "reg-04", fullName: "Mariama Diop", email: "mariama.diop@outlook.com", phone: "+221 77 456 78 90", city: "Dakar", registeredAt: new Date("2026-06-12T11:05:00Z"), status: "confirmed", paymentStatus: "paid" },
    { id: "reg-05", fullName: "Abdoulaye Ba", email: "a.ba@gmail.com", phone: "+221 76 567 89 01", city: "Ziguinchor", registeredAt: new Date("2026-06-13T16:30:00Z"), status: "confirmed", paymentStatus: "free", notes: "Étudiant boursier" },
    { id: "reg-06", fullName: "Aïssatou Ndiaye", email: "aissatou.ndiaye@gmail.com", phone: "+221 70 678 90 12", city: "Dakar", registeredAt: new Date("2026-06-14T09:00:00Z"), status: "pending", paymentStatus: "unpaid" },
    { id: "reg-07", fullName: "Moussa Traoré", email: "moussa.traore@gmail.com", phone: "+221 77 789 01 23", city: "Kaolack", registeredAt: new Date("2026-06-14T10:45:00Z"), status: "confirmed", paymentStatus: "paid" },
    { id: "reg-08", fullName: "Rokhaya Fall", email: "r.fall@hotmail.com", phone: "+221 76 890 12 34", city: "Dakar", registeredAt: new Date("2026-06-15T13:20:00Z"), status: "cancelled", paymentStatus: "unpaid", notes: "Annulation maladie" },
    { id: "reg-09", fullName: "Cheikh Ahmed Diallo", email: "c.ahmed@gmail.com", phone: "+221 70 901 23 45", city: "Rufisque", registeredAt: new Date("2026-06-16T08:10:00Z"), status: "confirmed", paymentStatus: "paid" },
    { id: "reg-10", fullName: "Khadiatou Sy", email: "khadiatou.sy@gmail.com", phone: "+221 77 012 34 56", city: "Thiès", registeredAt: new Date("2026-06-17T15:00:00Z"), status: "confirmed", paymentStatus: "paid" },
    { id: "reg-11", fullName: "Amadou Cissé", email: "amadou.cisse@yahoo.fr", phone: "+221 76 123 45 67", city: "Dakar", registeredAt: new Date("2026-06-18T09:30:00Z"), status: "pending", paymentStatus: "unpaid" },
    { id: "reg-12", fullName: "Ndéye Sarr", email: "ndeye.sarr@gmail.com", phone: "+221 70 234 56 78", city: "Mbour", registeredAt: new Date("2026-06-19T11:00:00Z"), status: "confirmed", paymentStatus: "paid" },
    { id: "reg-13", fullName: "Seydou Konaté", email: "seydou.konate@gmail.com", phone: "+221 77 345 67 89", city: "Dakar", registeredAt: new Date("2026-06-20T14:15:00Z"), status: "confirmed", paymentStatus: "free", notes: "Invité conférencier" },
    { id: "reg-14", fullName: "Aminata Baldé", email: "a.balde@gmail.com", phone: "+221 76 456 78 90", city: "Kolda", registeredAt: new Date("2026-06-21T10:00:00Z"), status: "confirmed", paymentStatus: "paid" },
    { id: "reg-15", fullName: "Hassan Touré", email: "hassan.toure@outlook.com", phone: "+221 70 567 89 01", city: "Dakar", registeredAt: new Date("2026-06-22T08:45:00Z"), status: "pending", paymentStatus: "unpaid" },
  ]).onConflictDoNothing();

  console.log("Seed terminé.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
