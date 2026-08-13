// Dictionnaire de normalisation, extensible.
// Ajouter une entree ici suffit a ameliorer le moteur — aucune logique a
// toucher. Toutes les cles sont comparees en majuscules, sans accents.

/** Abreviation de ticket de caisse -> mot complet (minuscule). */
export const ABBREVIATIONS: Record<string, string> = {
  LESS: "lessive",
  LIQ: "liquide",
  RAVI: "raviolis",
  MOUCH: "mouchoirs",
  PQ: "papier toilette",
  DEO: "deodorant",
  DENT: "dentifrice",
  SHAMP: "shampoing",
  YAO: "yaourts",
  YOG: "yaourts",
  FROM: "fromage",
  BISC: "biscuits",
  CHOC: "chocolat",
  CONF: "confiture",
  CEREAL: "cereales",
  SURG: "surgele",
  LEG: "legumes",
  FR: "fruits",
  VIA: "viande",
  POIS: "poisson",
  EAU: "eau",
  JUS: "jus",
  CAF: "cafe",
  THE: "the",
  SAV: "savon",
  GEL: "gel douche",
  LING: "lingettes",
  COUCH: "couches",
  CROQ: "croquettes",
  PAT: "pates",
  RIZ: "riz",
  HUIL: "huile",
  BEUR: "beurre",
  LAIT: "lait",
  OEUF: "oeufs",
};

/**
 * Tokens purement bruit (codes de format, mentions marketing, tailles) a
 * retirer du libelle. Ils n'apportent aucune information sur le produit
 * lui-meme.
 */
export const NOISE_TOKENS = new Set([
  "ECO",
  "BF",
  "GM",
  "PROMO",
  "NEW",
  "LOT",
  "PRIX",
]);

/**
 * Synonymes : forme normalisee -> nom canonique affiche a l'utilisateur.
 * Cle en minuscules, sans accents, telle que produite par le moteur avant
 * cette derniere passe.
 */
export const SYNONYMS: Record<string, string> = {
  cafe: "Café",
  the: "Thé",
  deodorant: "Déodorant",
  cereales: "Céréales",
  legumes: "Légumes",
  surgele: "Surgelé",
  oeufs: "Œufs",
};
