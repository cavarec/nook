import { stripAccents } from "./rules";

/**
 * Familles de produits : ce qui compte pour le moteur de stock, c'est la
 * famille (oeufs, cafe, lessive...), pas le libelle exact d'un ticket. Deux
 * ODNV 6OEUF PPA G ELE" un jour et "OEUFS BIO X6" le lendemain doivent
 * alimenter le MEME historique d'achats, sinon la confiance ne progresse
 * jamais et le stock "probable" reste toujours base sur un seul achat.
 *
 * Les entrees multi-mots ou plus specifiques sont placees avant leurs
 * sous-chaines plus generiques (ex: "pomme de terre" avant "pomme") pour
 * eviter les faux positifs — la premiere correspondance l'emporte.
 */
export const PRODUCT_FAMILIES: Array<{ canonical: string; keywords: string[] }> = [
  // Frais / epicerie de base
  { canonical: "Œufs", keywords: ["oeuf"] },
  { canonical: "Lait", keywords: ["lait"] },
  { canonical: "Beurre", keywords: ["beurre"] },
  { canonical: "Fromage", keywords: ["fromage", "mozzarella"] },
  { canonical: "Yaourts", keywords: ["yaourt", "yogourt"] },
  { canonical: "Crème fraîche", keywords: ["creme fraiche", "creme"] },
  { canonical: "Jambon", keywords: ["jambon"] },
  { canonical: "Café", keywords: ["cafe"] },
  { canonical: "Thé", keywords: [" the "] },
  { canonical: "Pâtes", keywords: ["pates", "coquillette", "farfalle"] },
  { canonical: "Riz", keywords: ["riz"] },
  { canonical: "Raviolis", keywords: ["ravioli"] },
  { canonical: "Céréales", keywords: ["cereale"] },
  { canonical: "Biscuits", keywords: ["biscuit", "biscotte"] },
  { canonical: "Chocolat", keywords: ["chocolat"] },
  { canonical: "Pâte à tartiner", keywords: ["tartine", "nutella"] },
  { canonical: "Confiture", keywords: ["confiture"] },
  { canonical: "Huile", keywords: ["huile"] },
  { canonical: "Farine", keywords: ["farine"] },
  { canonical: "Sucre", keywords: ["sucre"] },
  { canonical: "Sel", keywords: ["sel"] },
  { canonical: "Soupe", keywords: ["soupe"] },
  { canonical: "Pain", keywords: ["pain", "miche", "baguette", "brioche"] },
  { canonical: "Crêpes", keywords: ["crepe"] },
  { canonical: "Couscous / Semoule", keywords: ["couscous", "semoule"] },
  { canonical: "Moutarde", keywords: ["moutarde"] },
  { canonical: "Mayonnaise", keywords: ["mayonnaise"] },

  // Fruits & legumes (mots specifiques avant "pomme" seul)
  { canonical: "Pommes de terre", keywords: ["pommes de terre", "pdt "] },
  { canonical: "Pommes", keywords: ["pomme"] },
  { canonical: "Bananes", keywords: ["banane"] },
  { canonical: "Tomates", keywords: ["tomate"] },
  { canonical: "Carottes", keywords: ["carotte"] },
  { canonical: "Oignons", keywords: ["oignon"] },
  { canonical: "Citrons", keywords: ["citron"] },
  { canonical: "Avocats", keywords: ["avocat"] },
  { canonical: "Poires", keywords: ["poire"] },
  { canonical: "Oranges", keywords: ["orange"] },
  { canonical: "Pêches", keywords: ["peche"] },
  { canonical: "Melon", keywords: ["melon"] },
  { canonical: "Fraises", keywords: ["fraise"] },
  { canonical: "Salade", keywords: ["salade"] },
  { canonical: "Endives", keywords: ["endive"] },
  { canonical: "Courgettes", keywords: ["courgette"] },
  { canonical: "Champignons", keywords: ["champignon"] },

  // Boissons
  { canonical: "Eau", keywords: ["eau"] },
  { canonical: "Jus de fruits", keywords: ["jus"] },
  { canonical: "Soda", keywords: ["soda"] },
  { canonical: "Bière", keywords: ["biere"] },
  { canonical: "Vin", keywords: ["vin"] },

  // Hygiene
  { canonical: "Papier toilette", keywords: ["papier toilette"] },
  { canonical: "Mouchoirs", keywords: ["mouchoir"] },
  { canonical: "Déodorant", keywords: ["deodorant"] },
  { canonical: "Dentifrice", keywords: ["dentifrice"] },
  { canonical: "Shampoing", keywords: ["shampoing"] },
  { canonical: "Gel douche", keywords: ["gel douche"] },
  { canonical: "Savon", keywords: ["savon"] },
  { canonical: "Rasoirs", keywords: ["rasoir"] },

  // Entretien
  { canonical: "Lessive", keywords: ["lessive"] },
  { canonical: "Liquide vaisselle", keywords: ["liquide vaisselle"] },
  { canonical: "Éponges", keywords: ["eponge"] },
  { canonical: "Eau de Javel", keywords: ["javel"] },
  { canonical: "Lingettes", keywords: ["lingette"] },
  { canonical: "Sacs poubelle", keywords: ["sac poubelle"] },

  // Bebe / animaux
  { canonical: "Couches", keywords: ["couche"] },
  { canonical: "Croquettes", keywords: ["croquette"] },
  { canonical: "Litière", keywords: ["litiere"] },
];

/**
 * Retrouve la famille d'un nom de produit deja normalise (ex: "Oeufs bio
 * x6" ou "Odnv 6oeuf ppa g ele" -> "Œufs"). Retourne null si aucune
 * famille connue ne correspond : le produit reste identifie par son nom
 * exact (comportement precedent, evite les faux rapprochements sur des
 * libelles trop generiques ou des marques non reconnues).
 */
export function resolveProductFamily(name: string): string | null {
  const normalized = ` ${stripAccents(name.toLowerCase()).trim()} `;
  for (const { canonical, keywords } of PRODUCT_FAMILIES) {
    if (keywords.some((keyword) => normalized.includes(keyword))) {
      return canonical;
    }
  }
  return null;
}
