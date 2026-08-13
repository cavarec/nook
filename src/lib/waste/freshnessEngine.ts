import type { FreshnessResult, FreshnessStatus } from "@/lib/types/domain";
import { daysBetween } from "@/lib/stock/stats";

/**
 * Statut de fraicheur pour un produit perissable, uniquement a partir de la
 * date d'achat et de la duree moyenne de conservation — jamais de DLC
 * saisie manuellement.
 */
export function computeFreshness(
  purchaseDate: string,
  averageShelfLifeDays: number | null,
  now: Date = new Date()
): FreshnessResult {
  const daysSincePurchase = Math.max(0, daysBetween(new Date(purchaseDate), now));

  if (!averageShelfLifeDays || averageShelfLifeDays <= 0) {
    return { status: "unknown", daysSincePurchase, daysRemaining: null };
  }

  const daysRemaining = averageShelfLifeDays - daysSincePurchase;
  const remainingRatio = daysRemaining / averageShelfLifeDays;

  let status: FreshnessStatus;
  if (remainingRatio >= 0.5) {
    status = "fresh";
  } else if (remainingRatio >= 0.15) {
    status = "watch";
  } else {
    status = "urgent";
  }

  return { status, daysSincePurchase, daysRemaining };
}

export interface WasteCandidate {
  status: FreshnessStatus;
  price: number | null;
}

/** Valeur potentiellement gaspillee : produits urgents (et une part des "a surveiller"). */
export function calculatePotentialWasteValue(items: WasteCandidate[]): number {
  const total = items.reduce((sum, item) => {
    if (!item.price) return sum;
    if (item.status === "urgent") return sum + item.price;
    if (item.status === "watch") return sum + item.price * 0.5;
    return sum;
  }, 0);
  return Math.round(total * 100) / 100;
}
