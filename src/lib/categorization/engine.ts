import type { Category } from "@/lib/types/domain";
import { CATEGORY_KEYWORDS, normalizeForMatching } from "./rules";

const DEFAULT_CATEGORY: Category = "Maison";

/** Categorise un nom de produit deja normalise, par correspondance de mots-cles. */
export function categorizeProduct(productName: string): Category {
  const normalized = normalizeForMatching(productName);

  for (const { category, keywords } of CATEGORY_KEYWORDS) {
    if (keywords.some((keyword) => normalized.includes(keyword))) {
      return category;
    }
  }

  return DEFAULT_CATEGORY;
}
