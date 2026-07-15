@AGENTS.md

# Consignes spécifiques à Claude Code

## Comportement attendu
- Toujours lire `AGENTS.md` en entier avant de modifier du code dans ce projet.
- Ne **jamais** créer de `tailwind.config.ts` — la configuration Tailwind est dans `app/globals.css`.
- Ne **jamais** ajouter `"use client"` à un Server Component sans vérifier qu'un hook React ou un event handler est réellement nécessaire.
- Ne **pas** modifier `data/live.ts → youtubeChannelId` sans que l'utilisateur fournisse l'ID explicitement — ne pas inventer une URL YouTube.

## Commandes utiles
```bash
npm run dev        # serveur de développement (port 3000 par défaut)
npm run build      # build de production + vérification TypeScript
npm run lint       # ESLint
```

## Tests visuels
Il n'y a pas de suite de tests automatisés. Pour vérifier une modification visuelle, lancer `npm run dev` et utiliser Playwright (disponible dans `node_modules`) avec Chrome système (`/usr/bin/google-chrome`, flag `--no-sandbox`).

## Priorités de travail
1. Respecter la palette de couleurs As-Sakîna (hex exacts dans `AGENTS.md` et `app/globals.css`)
2. Maintenir la lisibilité du texte arabe (RTL, police Amiri)
3. Garder les pages accessibles au clavier (focus-visible sur tous les éléments interactifs)
