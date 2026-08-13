import type { PurchaseHistoryEntry, StockEstimate } from "@/lib/types/domain";
import { daysBetween, intervalsInDays, mean } from "./stats";

/**
 * Estime la quantite restante d'un produit a partir de son historique
 * d'achats. Jamais presente comme une valeur exacte cote UI ("Stock
 * probable") — voir src/lib/confidence pour le score qui l'accompagne.
 *
 * Principe : intervalle moyen entre achats + quantite moyenne achetee =>
 * taux de consommation journalier, applique au temps ecoule depuis le
 * dernier achat.
 */
export function estimateStock(
  history: PurchaseHistoryEntry[],
  now: Date = new Date()
): StockEstimate {
  if (history.length === 0) {
    return { estimatedQuantity: 0, averageIntervalDays: null, daysSinceLastPurchase: 0 };
  }

  const sorted = [...history].sort(
    (a, b) => new Date(a.purchaseDate).getTime() - new Date(b.purchaseDate).getTime()
  );
  const last = sorted[sorted.length - 1];
  if (!last) {
    return { estimatedQuantity: 0, averageIntervalDays: null, daysSinceLastPurchase: 0 };
  }

  const lastDate = new Date(last.purchaseDate);
  const daysSinceLastPurchase = Math.max(0, daysBetween(lastDate, now));

  if (sorted.length === 1) {
    return {
      estimatedQuantity: last.quantity,
      averageIntervalDays: null,
      daysSinceLastPurchase,
    };
  }

  const dates = sorted.map((p) => new Date(p.purchaseDate));
  const intervals = intervalsInDays(dates);
  const averageIntervalDays = mean(intervals);
  const averageQuantity = mean(sorted.map((p) => p.quantity));

  const consumptionPerDay =
    averageIntervalDays > 0 ? averageQuantity / averageIntervalDays : 0;

  const rawEstimate = last.quantity - consumptionPerDay * daysSinceLastPurchase;
  const estimatedQuantity = Math.max(0, Math.round(rawEstimate * 100) / 100);

  return { estimatedQuantity, averageIntervalDays, daysSinceLastPurchase };
}
