# Summer Closing Villa — Summer Pass

Prototype fonctionnel Vite + Supabase basé sur les écrans validés.

## Lancer en local

```bash
npm install
npm run dev
```

## Codes de prototype

- Accès invités : `Villa2026`
- Espace organisatrice : `organisatrice2026`

Change ces codes avant la mise en ligne publique.

## Brancher Supabase

1. Créer un projet Supabase.
2. Exécuter `supabase.sql` dans le SQL Editor.
3. Copier `.env.example` vers `.env`.
4. Renseigner `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`.
5. Relancer `npm run dev`.

Sans Supabase, le site fonctionne en prototype local avec `localStorage`.

## Mise en ligne

Le projet est compatible avec Vercel, Netlify ou toute plateforme statique capable de lancer :

```bash
npm run build
```

et publier le dossier `dist`.

## Important

Les vues organisatrice affichent actuellement des métriques de démonstration pour reproduire la DA validée.
Les synthèses doivent être calculées à partir des vraies réponses dès que Supabase est connecté.
