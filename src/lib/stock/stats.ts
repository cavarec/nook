// Petits utilitaires statistiques partages par les moteurs stock et confiance.

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export function daysBetween(from: Date, to: Date): number {
  return Math.round((to.getTime() - from.getTime()) / MS_PER_DAY);
}

export function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

/** Ecart-type de population (les intervalles disponibles sont l'historique complet). */
export function stdDev(values: number[]): number {
  if (values.length === 0) return 0;
  const avg = mean(values);
  const variance = mean(values.map((v) => (v - avg) ** 2));
  return Math.sqrt(variance);
}

export function sortedPurchaseDates(dates: string[]): Date[] {
  return [...dates]
    .map((d) => new Date(d))
    .sort((a, b) => a.getTime() - b.getTime());
}

/** Intervalles en jours entre achats consecutifs, dates deja triees. */
export function intervalsInDays(sortedDates: Date[]): number[] {
  const intervals: number[] = [];
  for (let i = 1; i < sortedDates.length; i++) {
    const prev = sortedDates[i - 1];
    const curr = sortedDates[i];
    if (prev && curr) {
      intervals.push(daysBetween(prev, curr));
    }
  }
  return intervals;
}
