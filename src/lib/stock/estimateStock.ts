import type {
  PurchaseHistoryEntry,
  StockCorrection,
  StockEstimate,
} from "@/lib/types/domain";
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

/**
 * Applique les corrections manuelles (+/-, "termine", "encore disponible")
 * par-dessus l'estimation issue des achats. Seules les corrections
 * posterieures au dernier achat comptent : un nouvel achat est un signal
 * plus fort qui remet le compteur a zero par rapport a d'anciennes
 * corrections.
 */
export function applyStockCorrections(
  baseQuantity: number,
  lastPurchaseDate: string | null,
  corrections: StockCorrection[]
): number {
  const relevant = lastPurchaseDate
    ? corrections.filter(
        (c) => new Date(c.createdAt).getTime() >= new Date(lastPurchaseDate).getTime()
      )
    : corrections;

  if (relevant.length === 0) return baseQuantity;

  const sorted = [...relevant].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  let quantity = baseQuantity;
  for (const correction of sorted) {
    switch (correction.type) {
      case "increment":
        quantity += 1;
        break;
      case "decrement":
        quantity = Math.max(0, quantity - 1);
        break;
      case "finished":
        quantity = 0;
        break;
      case "still_available":
        quantity = Math.max(quantity, 1);
        break;
    }
  }

  return Math.round(quantity * 100) / 100;
}
