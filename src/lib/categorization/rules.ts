import type { Category } from "@/lib/types/domain";
import { stripAccents } from "@/lib/normalization/rules";

/**
 * Mots-cles (normalises produit, en minuscules, sans accents) -> categorie.
 * La premiere correspondance l'emporte ; ajouter une entree suffit a
 * ameliorer la couverture.
 */
export const CATEGORY_KEYWORDS: Array<{ category: Category; keywords: string[] }> = [
  {
    category: "Frais",
    keywords: [
      "lait",
      "yaourt",
      "fromage",
      "beurre",
      "creme",
      "oeuf",
      "jambon",
      "charcuterie",
      "viande",
      "poisson",
      "saumon",
      "poulet",
      "boeuf",
    ],
  },
  {
    category: "Fruits & Legumes",
    keywords: [
      "banane",
      "pomme",
      "tomate",
      "salade",
      "carotte",
      "oignon",
      "citron",
      "fruit",
      "legume",
      "avocat",
      "poire",
      "orange",
    ],
  },
  {
    category: "Surgeles",
    keywords: ["surgele", "glace", "frites surgelees", "poisson pane"],
  },
  {
    category: "Epicerie",
    keywords: [
      "pates",
      "riz",
      "raviolis",
      "cereales",
      "biscuits",
      "chocolat",
      "confiture",
      "huile",
      "farine",
      "sucre",
      "sel",
      "conserve",
      "soupe",
      "cafe",
      "the",
    ],
  },
  {
    category: "Boissons",
    keywords: ["eau", "jus", "soda", "biere", "vin", "boisson"],
  },
  {
    category: "Hygiene",
    keywords: [
      "deodorant",
      "dentifrice",
      "shampoing",
      "gel douche",
      "savon",
      "rasoir",
      "coton",
      "mouchoir",
      "papier toilette",
      "serviette hygienique",
    ],
  },
  {
    category: "Entretien",
    keywords: [
      "lessive",
      "liquide vaisselle",
      "eponge",
      "nettoyant",
      "javel",
      "lingette",
      "sac poubelle",
    ],
  },
  {
    category: "Bebe",
    keywords: ["couche", "lingette bebe", "lait infantile", "petit pot", "biberon"],
  },
  {
    category: "Animaux",
    keywords: ["croquette", "pate chat", "pate chien", "litiere"],
  },
  {
    category: "Bricolage",
    keywords: ["ampoule", "pile", "outil", "visserie", "peinture"],
  },
];

export function normalizeForMatching(input: string): string {
  return stripAccents(input.toLowerCase()).trim();
}
