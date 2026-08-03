export interface DailyContent {
  id: string;
  type: "verse" | "hadith";
  title: string;
  arabicText: string;
  transliteration?: string;
  translation: string;
  reference: string;
  explanation: string;
  audioUrl?: string;
  dateStr?: string;
}

export const dailyContents: DailyContent[] = [
  {
    id: "daily-1",
    type: "verse",
    title: "La Recherche de la Science",
    arabicText: "وَقُل رَّبِّ زِدْنِي عِلْمًا",
    transliteration: "Wa qul Rabbi zidni 'ilma",
    translation: "Et dis : « Ô mon Seigneur, accrois mes connaissances ! »",
    reference: "Sourate Taha (20:114)",
    explanation:
      "Ce verset met en lumière l'obligation constante pour le croyant de rechercher le savoir bénéfique qui rapproche d'Allah. L'apprentissage est une adoration continue.",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    dateStr: "Aujourd'hui",
  },
  {
    id: "daily-2",
    type: "hadith",
    title: "L'Intention Purifiée",
    arabicText: "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى",
    transliteration: "Innamal a'malu bin-niyyat, wa innama likulli-mri'in ma nawa",
    translation: "Les actions ne valent que par leurs intentions, et chacun ne sera rétribué que selon ce qu'il a intentionné.",
    reference: "Rapporté par Al-Bukhari & Muslim",
    explanation:
      "La sincérité (Ikhlas) est le pilier fondamental de tout acte en Islam. Avant d'entreprendre une œuvre, interrogeons notre cœur pour l'orienter uniquement vers Allah.",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    dateStr: "Rappel quotidien",
  },
  {
    id: "daily-3",
    type: "verse",
    title: "Le Souvenir d'Allah",
    arabicText: "فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ",
    transliteration: "Fadhkuruni adhkurkum washkuru li wa la takfurun",
    translation: "Souvenez-vous de Moi donc, Je me souviendrai de vous. Remerciez-Moi et ne soyez pas ingrats envers Moi.",
    reference: "Sourate Al-Baqarah (2:152)",
    explanation:
      "Le Dhikr est la vie du cœur. Se souvenir d'Allah apporte la quiétude, éloigne les soucis et garantit la bénédiction dans les assises de science.",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    dateStr: "Rappel du cœur",
  },
];
