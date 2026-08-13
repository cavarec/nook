// Regles generiques (non liees a un mot precis) de nettoyage de libelle.

/** Tokens de type quantite/format a retirer : X10, 10X, 500G, 1.5L, 33CL... */
const QUANTITY_TOKEN_PATTERN =
  /^X?\d+([.,]\d+)?(X|G|KG|ML|CL|L)?X?$/i;

/** Motif dedie a l'extraction d'un multiplicateur de type "X10" ou "10X". */
const MULTIPLIER_PATTERN = /^(?:X(\d+)|(\d+)X)$/i;

export function isNoiseQuantityToken(token: string): boolean {
  return QUANTITY_TOKEN_PATTERN.test(token);
}

/** Extrait un multiplicateur de quantite depuis un token (ex: "X10" -> 10). */
export function extractMultiplier(token: string): number | null {
  const match = MULTIPLIER_PATTERN.exec(token);
  if (!match) return null;
  const value = match[1] ?? match[2];
  const parsed = value ? parseInt(value, 10) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

/** Retire accents pour permettre des comparaisons insensibles a l'accentuation. */
const COMBINING_DIACRITICS = /[̀-ͯ]/g;

export function stripAccents(input: string): string {
  return input.normalize("NFD").replace(COMBINING_DIACRITICS, "");
}

export function tokenize(raw: string): string[] {
  return raw
    .trim()
    .split(/\s+/)
    .filter((token) => token.length > 0);
}
