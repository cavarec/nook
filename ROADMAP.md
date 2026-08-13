# Roadmap NOOK

## V1 (ce dépôt)

Import de tickets (OCR client-side), normalisation, catégorisation, moteur
de stock probable, score de confiance, anti-gaspillage pour les produits
frais, mode courses, tableau de bord, offline-first (IndexedDB + sync
Supabase), PWA installable, architecture prête pour le compte familial.

## V2

- **Scan de code-barres** : le champ `barcode` existe déjà sur `products` ;
  ajouter la capture caméra (API `BarcodeDetector` ou lib dédiée) pour
  associer un produit sans repasser par l'OCR.
- **Résolution de conflits de synchronisation** : la sync actuelle est
  "dernière écriture gagne" (voir `src/lib/db/sync.ts`). Passer à une
  synchro basée sur des vecteurs de version ou un flux d'évènements pour
  gérer les écritures concurrentes multi-appareils dans un même foyer.
- **Notifications de rupture probable** : notification push (Web Push /
  PWA) quand le stock probable d'un produit suivi passe sous un seuil.
- **Partage de foyer avancé** : invitations par email, rôles plus fins
  (lecture seule, gestion des courses uniquement), transfert de propriété.
- **Édition manuelle enrichie** : correction de catégorie, de marque, fusion
  de doublons de produits créés par des libellés différents.

## V3

- **Suggestions de courses prédictives** : liste de courses générée
  automatiquement avant la date probable de rupture, basée sur l'historique
  de fréquentation du foyer.
- **Intégration API magasins/enseignes** : import direct des tickets
  électroniques sans passer par l'OCR quand l'enseigne le permet.
- **Multi-langue** : extraction du dictionnaire de normalisation et des
  catégories vers des fichiers de traduction, au-delà du français actuel.
- **Statistiques avancées** : tendances de consommation par saison,
  comparaison de prix entre enseignes à partir des tickets importés.
