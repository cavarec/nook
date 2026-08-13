# NOOK

**Votre maison a de la mémoire.**

NOOK n'est pas un inventaire parfait — c'est la mémoire du foyer. Il répond à
une seule question : *est-ce que j'en ai encore à la maison ?*

Importez vos tickets de caisse (PDF, JPG, PNG, capture d'écran). NOOK
reconstruit automatiquement votre stock probable, avec un score de confiance
transparent, sans jamais prétendre à l'exactitude.

## Stack

- **Frontend** : Next.js 15 (App Router), TypeScript strict, Tailwind CSS,
  composants inspirés de shadcn/ui, icônes Lucide.
- **Backend** : Supabase (Postgres, Auth, Storage, Row Level Security).
- **OCR** : Tesseract.js (client-side, WASM) + pdf.js pour les PDF texte et
  scannés.
- **Offline-first** : IndexedDB (Dexie.js) comme source de vérité locale,
  synchronisée vers Supabase au retour du réseau.
- **PWA** : next-pwa, installable sur Android et iOS.

## Démarrer en local

```bash
npm install
cp .env.example .env.local   # renseigner les clés Supabase
npm run dev
```

L'application est disponible sur `http://localhost:3000`.

## Base de données

Le schéma complet (tables, RLS, index, contraintes, trigger de création de
foyer) se trouve dans [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql).
Appliquez-le via le CLI Supabase :

```bash
supabase link --project-ref <votre-projet>
supabase db push
```

## Tests

Les moteurs métier (normalisation, catégorisation, estimation de stock,
score de confiance, fraîcheur/anti-gaspillage) sont couverts par des tests
unitaires Vitest :

```bash
npm run test
```

## Architecture des moteurs

- `src/lib/normalization` — nettoyage des libellés de ticket ("LESS LIQ ECO"
  → "Lessive liquide"), extensible via `dictionary.ts`.
- `src/lib/categorization` — classement automatique par mots-clés dans les
  11 catégories du foyer.
- `src/lib/ocr` — extraction de texte (Tesseract.js / pdf.js) puis parsing
  du ticket (`parseReceipt.ts`) : TVA, totaux, moyens de paiement et
  promotions sont ignorés.
- `src/lib/stock/estimateStock.ts` — stock probable à partir de la fréquence
  et de la quantité des achats passés.
- `src/lib/confidence/scoreConfidence.ts` — score de confiance (0-100 %)
  basé sur la fréquence, la régularité, l'ancienneté et les corrections
  manuelles.
- `src/lib/waste/freshnessEngine.ts` — statut 🟢/🟠/🔴 pour les produits
  frais, à partir de la date d'achat et de la durée moyenne de conservation.

Aucun de ces moteurs n'utilise d'IA externe : ce sont des algorithmes
déterministes et explicables.

## Déploiement

Voir [`VERCEL_DEPLOY.md`](VERCEL_DEPLOY.md).

## Roadmap

Voir [`ROADMAP.md`](ROADMAP.md) pour les évolutions V2 et V3.
