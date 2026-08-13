import type {
  ConfidenceFactors,
  PurchaseHistoryEntry,
} from "@/lib/types/domain";
import { daysBetween, intervalsInDays, mean, stdDev } from "@/lib/stock/stats";

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

/** Construit les facteurs de confiance a partir de l'historique brut. */
export function buildConfidenceFactors(
  history: PurchaseHistoryEntry[],
  manualCorrectionCount: number,
  now: Date = new Date()
): ConfidenceFactors {
  if (history.length === 0) {
    return {
      purchaseCount: 0,
      averageIntervalDays: null,
      intervalStdDevDays: null,
      historyAgeDays: 0,
      manualCorrectionCount,
      averageQuantity: 0,
    };
  }

  const sorted = [...history].sort(
    (a, b) => new Date(a.purchaseDate).getTime() - new Date(b.purchaseDate).getTime()
  );
  const dates = sorted.map((p) => new Date(p.purchaseDate));
  const first = dates[0];
  const intervals = intervalsInDays(dates);
  const averageQuantity = mean(sorted.map((p) => p.quantity));

  return {
    purchaseCount: sorted.length,
    averageIntervalDays: intervals.length > 0 ? mean(intervals) : null,
    intervalStdDevDays: intervals.length > 0 ? stdDev(intervals) : null,
    historyAgeDays: first ? Math.max(0, daysBetween(first, now)) : 0,
    manualCorrectionCount,
    averageQuantity,
  };
}

/**
 * Score de confiance (0-1) : combinaison ponderee de la frequence d'achat,
 * de la regularite, de l'anciennete de l'historique, des corrections
 * manuelles et de la quantite habituellement achetee. Aucune IA externe —
 * uniquement des heuristiques transparentes et ajustables ci-dessous.
 */
export function scoreConfidence(factors: ConfidenceFactors): number {
  const frequencyScore = clamp01(factors.purchaseCount / 6);

  let regularityScore = 0;
  if (factors.averageIntervalDays && factors.averageIntervalDays > 0) {
    const cv = (factors.intervalStdDevDays ?? 0) / factors.averageIntervalDays;
    regularityScore = clamp01(1 - cv);
  }

  const historyAgeScore = clamp01(factors.historyAgeDays / 180);
  const correctionsScore = clamp01(factors.manualCorrectionCount / 5);
  const quantityScore = clamp01(factors.averageQuantity / 5);

  const weighted =
    frequencyScore * 0.3 +
    regularityScore * 0.3 +
    historyAgeScore * 0.2 +
    correctionsScore * 0.15 +
    quantityScore * 0.05;

  return Math.round(clamp01(weighted) * 1000) / 1000;
}
