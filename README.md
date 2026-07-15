# Abu Maryam TV

Plateforme éducative islamique publique pour **Oustaz Niang Mbaye (H.A)** — cours, conférences, khoutbas du vendredi, séminaires et diffusions en direct. Direction visuelle **As-Sakîna** (palette olive & or, fond beige).

## Stack technique

- **Next.js 16** — App Router, TypeScript, rendu statique par défaut
- **Tailwind CSS v4** — tokens de design dans `app/globals.css` (`@theme {}`)
- **Polices** — Cormorant Garamond (titres serif) + Hanken Grotesk (UI) + Amiri (arabe RTL), chargées via `next/font/google`

## Lancer le projet

```bash
npm install
npm run dev        # http://localhost:3000
```

```bash
npm run build      # vérification TypeScript + build de production
npm run lint       # ESLint
```

## Structure

```
abu-maryam-tv/
├── app/
│   ├── layout.tsx              # Root layout (polices, metadata)
│   ├── globals.css             # Tailwind @theme + tokens couleurs + animations
│   ├── page.tsx                # Accueil
│   ├── bibliotheque/page.tsx   # Bibliothèque (filtres client-side)
│   ├── en-direct/page.tsx      # En direct
│   ├── evenements/page.tsx     # Événements & agenda
│   ├── inscription/page.tsx    # Formulaire d'inscription au séminaire
│   └── a-propos/page.tsx       # Profil de l'Oustaz
├── components/
│   ├── layout/                 # Navbar, MobileHeader, BottomNav, Footer
│   ├── ui/                     # Button, Badge, LiveDot, ContentCard, ImagePlaceholder
│   ├── home/                   # Hero, SeminarBanner, TeachingsGrid, LiveReplays, ThemeGrid, HomeCTA
│   ├── bibliotheque/           # FilterPanel
│   ├── live/                   # VideoPlayer, LiveSidebar
│   ├── evenements/             # SeminarHero, AgendaList
│   ├── inscription/            # SeminarRecap, RegistrationForm
│   └── apropos/                # (intégré dans a-propos/page.tsx)
├── data/
│   ├── teachings.ts            # 12 enseignements mock → à remplacer par CMS
│   ├── events.ts               # Séminaire + agenda
│   ├── live.ts                 # Statut live, replays, programme
│   └── themes.ts               # 6 thèmes avec lettre arabe
└── lib/
    └── types.ts                # Types TypeScript (Teaching, LiveStatus, AgendaItem…)
```

## Pages

| URL | Contenu |
|---|---|
| `/` | Hero · Carte séminaire · Derniers enseignements · Direct & Replays · Thèmes · CTA |
| `/bibliotheque` | Recherche + filtres (type / thème / langue) + grille paginée |
| `/en-direct` | Player YouTube Live (ou placeholder) · Programme · Replays |
| `/evenements` | Héro séminaire · Agenda toggleable À venir / Passés |
| `/inscription` | Formulaire d'inscription au séminaire (validation + états) |
| `/a-propos` | Profil Oustaz · Mission · 4 valeurs · CTA |

## Design tokens (palette As-Sakîna)

| Token | Hex | Usage |
|---|---|---|
| `olive-dark` | `#3c4a37` | Fond bandeaux, boutons principaux |
| `gold` | `#b58a3c` | CTA, soulignés actifs, accents |
| `gold-mid` | `#cda350` | Versets arabes, lettres logo |
| `gold-light` | `#e3c685` | Texte doré sur fond sombre |
| `terracotta` | `#8a2f29` | Live, urgence, places limitées |
| `bg-main` | `#efe9dc` | Fond principal de page |
| `bg-card` | `#fbf9f3` | Fond cartes, navbar, footer |
| `bg-secondary` | `#e9e3d4` | Fond bandeau entête pages |
| `border-light` | `#e2dac9` | Bordures cartes |
| `text-tertiary` | `#9a9483` | Placeholders, méta |

## Contenu réel à fournir

Pour passer du prototype à la production, ces éléments sont attendus :

- **Photo de l'Oustaz en prêche** → Hero de l'Accueil
- **Portrait de l'Oustaz** → Page À propos
- **Photo du séminaire** → Carte accueil + page Événements
- **Logo officiel Abu Maryam TV** → Remplacer le glyphe "أ" temporaire
- **ID chaîne YouTube** → `data/live.ts → youtubeChannelId` (player live)
- **Catalogue des cours** → `data/teachings.ts` (titre, durée, thème, langue, URL média)
- **URL API ou CMS** → Pour remplacer les fichiers `data/*.ts` statiques

## Brancher le formulaire d'inscription

Le `onSubmit` dans `components/inscription/RegistrationForm.tsx` est isolé. Remplacer le bloc `// Point de branchement API` par un `fetch` vers votre endpoint :

```ts
// Remplacer ce bloc dans RegistrationForm.tsx
const res = await fetch('/api/inscription', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(form),
});
if (!res.ok) throw new Error('Erreur serveur');
```

## Brancher le player YouTube Live

Dans `data/live.ts`, renseigner l'ID de la chaîne :

```ts
youtubeChannelId: "UCxxxxxxxxxxxxxxxx", // ID de la chaîne YouTube
```

Le composant `VideoPlayer.tsx` switche automatiquement vers l'embed YouTube Live.
