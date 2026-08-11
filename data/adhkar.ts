export interface DhikrItem {
  id: string;
  category: "matin" | "soir" | "priere";
  title: string;
  titleAr: string;
  arabicText: string;
  transliteration: string;
  translation: string;
  repeatCount: number;
  source: string;
  sourceAr: string;
  merit?: string;
  meritAr?: string;
  audioUrl?: string;
}

export const adhkarData: DhikrItem[] = [
  // --- MATIN ---
  {
    id: "m-1",
    category: "matin",
    title: "Ayat Al-Kursi (Le Verset du Trône)",
    titleAr: "آية الكرسي",
    arabicText:
      "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ",
    transliteration:
      "Allahu la ilaha illa Huwal-Hayyul-Qayyum. La ta'khudhuhu sinatun wa la nawm...",
    translation:
      "Allah ! Point de divinité à part Lui, Le Vivant, Celui qui subsiste par Lui-même. Ni l'assoupissement ni le sommeil n'ont de prise sur Lui...",
    repeatCount: 1,
    source: "Sourate Al-Baqarah (2:255)",
    sourceAr: "سورة البقرة، الآية 255",
    merit: "Qui la récite le matin est protégé des djinns jusqu'au soir.",
    meritAr: "من قرأها حين يصبح كان في حفظ الله من الجن حتى يمسي.",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  },
  {
    id: "m-2",
    category: "matin",
    title: "Sayyid Al-Istighfar (La Maîtresse des Invocations de Pardon)",
    titleAr: "سيد الاستغفار",
    arabicText:
      "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَٰهَ إِلَّا أَنْتَ ، خَلَقْتَنِي وَأَنَا عَبْدُكَ ، وَأَنَا عَلَىٰ عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ",
    transliteration:
      "Allahumma Anta Rabbi la ilaha illa Anta, khalaqtani wa ana 'abduka, wa ana 'ala 'ahdika wa wa'dika mas-tata'tu...",
    translation:
      "Ô Allah ! Tu es mon Seigneur, il n'y a de divinité que Toi. Tu m'as créé et je suis Ton serviteur. Je suis fidèle à Ton engagement et à Ta promesse autant que je le puis...",
    repeatCount: 1,
    source: "Rapporté par Al-Bukhari",
    sourceAr: "رواه البخاري",
    merit: "Celui qui la récite avec certitude le matin et meurt dans la journée entrera au Paradis.",
    meritAr: "من قالها موقنًا بها حين يصبح فمات من يومه دخل الجنة.",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  },
  {
    id: "m-3",
    category: "matin",
    title: "Protection contre tout mal",
    titleAr: "بسم الله الذي لا يضر مع اسمه شيء",
    arabicText:
      "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
    transliteration:
      "Bismillahil-ladhi la yadurru ma'as-mihi shay'un fil-ardi wa la fis-sama'i wa Huwas-Sami'ul-'Alim.",
    translation:
      "Au nom d'Allah, avec le nom duquel rien ne peut nuire sur terre ni dans le ciel, et Il est l'Audient, l'Omniscient.",
    repeatCount: 3,
    source: "Rapporté par Abu Dawood & At-Tirmidhi",
    sourceAr: "رواه أبو داود والترمذي",
    merit: "Rien ne pourra lui nuire durant la journée.",
    meritAr: "لم يضره شيء في ذلك اليوم.",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
  },
  {
    id: "m-4",
    category: "matin",
    title: "Satisfaction d'Allah et de l'Islam",
    titleAr: "الرضا بالله ربًا",
    arabicText:
      "رَضِيتُ بِاللَّهِ رَبًّا ، وَبِالْإِسْلَامِ دِينًا ، وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا",
    transliteration:
      "Raditu billahi Rabban, wa bil-Islami dinan, wa bi-Muhammadin sallallahu 'alayhi wa sallama Nabiyyan.",
    translation:
      "J'agrée Allah comme Seigneur, l'Islam comme religion, et Mouhammad ﷺ comme Prophète.",
    repeatCount: 3,
    source: "Rapporté par Ahmad & At-Tirmidhi",
    sourceAr: "رواه أحمد والترمذي",
    merit: "Allah S'engage à le satisfaire le Jour du Jugement.",
    meritAr: "كان حقًا على الله أن يُرضيه يوم القيامة.",
  },

  // --- SOIR ---
  {
    id: "s-1",
    category: "soir",
    title: "Protection du Soir",
    titleAr: "ذكر المساء",
    arabicText:
      "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ",
    transliteration:
      "Amsayna wa amsal-mulku lillah, wal-hamdu lillah, la ilaha illallahu wahdahu la sharika lah...",
    translation:
      "Nous sommes au soir et la royauté appartient à Allah. Louange à Allah. Il n'y a de divinité qu'Allah, Seul sans associé...",
    repeatCount: 1,
    source: "Rapporté par Muslim",
    sourceAr: "رواه مسلم",
    merit: "Invocation de protection pour la nuit.",
    meritAr: "ذكر للحماية طوال الليل.",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
  },
  {
    id: "s-2",
    category: "soir",
    title: "Demande de protection par les paroles parfaites",
    titleAr: "التعوذ بكلمات الله التامات",
    arabicText:
      "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
    transliteration:
      "A'udhu bi-kalimatil-lahit-tammati min sharri ma khalaq.",
    translation:
      "Je cherche protection auprès des paroles parfaites d'Allah contre le mal qu'Il a créé.",
    repeatCount: 3,
    source: "Rapporté par Muslim",
    sourceAr: "رواه مسلم",
    merit: "Aucune piqûre ni venin ne lui nuira pendant cette nuit.",
    meritAr: "لم يضره شيء حتى يصبح.",
  },

  // --- APRES PRIERE ---
  {
    id: "p-1",
    category: "priere",
    title: "Demande de pardon & Salutations de Paix",
    titleAr: "الاستغفار والتسليم بعد الصلاة",
    arabicText:
      "أَسْتَغْفِرُ اللَّهَ (٣x) ، اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ",
    transliteration:
      "Astaghfirullah (3x), Allahumma Antas-Salamu wa minkas-salam, tabarakta ya Dhal-Jalali wal-Ikram.",
    translation:
      "Je demande pardon à Allah (3 fois). Ô Allah ! Tu es la Paix et de Toi vient la paix. Béni sois-Tu, Ô Possesseur de la Majesté et de la Noblesse.",
    repeatCount: 1,
    source: "Rapporté par Muslim",
    sourceAr: "رواه مسلم",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  },
  {
    id: "p-2",
    category: "priere",
    title: "Tasbih, Tahmid et Takbir",
    titleAr: "التسبيح والتحميد والتكبير",
    arabicText:
      "سُبْحَانَ اللَّهِ (٣٣x) ، الْحَمْدُ لِلَّهِ (٣٣x) ، اللَّهُ أَكْبَرُ (٣٣x)\n\nلَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ",
    transliteration:
      "SubhanAllah (33x), Al-Hamdulillah (33x), Allahu Akbar (33x) + La ilaha illallah wahdahu la sharika lah...",
    translation:
      "Gloire à Allah (33x), Louange à Allah (33x), Allah est le Plus Grand (33x). Puis compléter le centième par : Il n'y a de divinité qu'Allah Seul sans associé...",
    repeatCount: 33,
    source: "Rapporté par Muslim",
    sourceAr: "رواه مسلم",
    merit: "Ses péchés seront pardonnés, fussent-ils comme l'écume de la mer.",
    meritAr: "غُفرت خطاياه وإن كانت مثل زَبَد البحر.",
  },
];
