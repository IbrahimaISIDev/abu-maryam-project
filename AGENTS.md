<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Abu Maryam TV — Notes pour les agents IA

## Stack
- **Next.js 16** (App Router) + **TypeScript** + **Tailwind CSS v4**
- Tailwind v4 : les tokens de design sont déclarés dans `app/globals.css` via `@theme {}` — il n'existe **pas** de `tailwind.config.ts`. Ne pas en créer.
- Polices Google Fonts chargées via `next/font/google` (Cormorant Garamond, Hanken Grotesk, Amiri) — variables CSS : `--font-cormorant`, `--font-hanken`, `--font-amiri`.

## Règle Tailwind v4 critique
En Tailwind v4, quand deux utilitaires de la même propriété CSS sont sur le même élément (ex. `relative` et `absolute`), c'est **l'ordre de génération dans le CSS qui gagne**, pas l'ordre dans l'attribut `class`. `relative` est généré après `absolute` → `relative` l'emporte toujours. **Ne jamais mettre `relative` dans les classes de base d'un composant si les appelants peuvent passer `absolute`.** Voir `ImagePlaceholder.tsx` pour la solution retenue (background-image CSS au lieu d'un enfant `absolute inset-0`).

## Architecture des données
Les données sont des constantes TypeScript dans `data/` — pas de base de données ni de CMS pour l'instant. Pour brancher une vraie API, remplacer les imports directs dans les composants par des appels `fetch` ou des Server Components.
- `data/teachings.ts` — liste des enseignements (12 entrées mock)
- `data/events.ts` — séminaire + agenda
- `data/live.ts` — statut live, replays, programme
- `data/themes.ts` — 6 thèmes avec lettre arabe et compteur

## Conventions de code
- **Polices** : toujours via `font-[var(--font-cormorant)]`, `font-[var(--font-hanken)]`, `font-[var(--font-amiri)]` — pas de classes Tailwind `font-serif` ou `font-sans`.
- **Couleurs** : couleurs hex brutes en Tailwind JIT (`text-[#b58a3c]`, `bg-[#3c4a37]`, etc.) — les tokens `@theme` sont disponibles mais les hex directs sont plus explicites et plus sûrs.
- **Texte arabe** : ajouter la classe `.arabic` ou `dir="rtl"` + `font-[var(--font-amiri)]`. Ne jamais mettre du texte arabe dans une police latine.
- **Composants** : Server Components par défaut. Ajouter `"use client"` uniquement si le composant utilise `useState`, `useEffect`, `usePathname`, ou des event handlers.
- **ImagePlaceholder** : ne pas mettre `relative` dans ses classes de base. Passer `relative` en `className` quand nécessaire (usage inline), ou `absolute inset-0` pour remplir un conteneur positionné.

## Pages et routes
| Route | Fichier | Type |
|---|---|---|
| `/` | `app/page.tsx` | Server Component |
| `/bibliotheque` | `app/bibliotheque/page.tsx` | Client Component (filtres) |
| `/en-direct` | `app/en-direct/page.tsx` | Server Component |
| `/evenements` | `app/evenements/page.tsx` | Server Component |
| `/inscription` | `app/inscription/page.tsx` | Server Component |
| `/a-propos` | `app/a-propos/page.tsx` | Server Component |

## Player YouTube Live
`data/live.ts` → `youtubeChannelId: null` — à renseigner avec l'ID de la chaîne YouTube. Le composant `VideoPlayer.tsx` switche automatiquement vers l'embed YouTube quand la valeur est non-null.

## Ce qui reste à faire (contenu réel)
- Remplacer les `ImagePlaceholder` par de vraies images (`next/image`)
- Renseigner `youtubeChannelId` dans `data/live.ts`
- Brancher le formulaire d'inscription sur une vraie API (le `onSubmit` dans `RegistrationForm.tsx` est isolé et prêt)
- Alimenter `data/teachings.ts` avec les vrais cours
