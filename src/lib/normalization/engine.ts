import { ABBREVIATIONS, NOISE_TOKENS, SYNONYMS } from "./dictionary";
import {
  extractMultiplier,
  isNoiseQuantityToken,
  stripAccents,
  tokenize,
} from "./rules";

export interface NormalizationResult {
  /** Nom nettoye, pret a afficher ("Lessive liquide"). */
  name: string;
  /** Multiplicateur de quantite detecte dans le libelle (ex: "X10" -> 10). */
  quantityMultiplier: number;
}

/**
 * Pipeline : dictionnaire d'abreviations -> retrait du bruit (formats,
 * mentions marketing) -> synonymes -> mise en forme finale.
 * Chaque etape est independante et extensible via dictionary.ts, sans
 * toucher a cette fonction.
 */
export function normalizeProductLabel(raw: string): NormalizationResult {
  const tokens = tokenize(raw);
  const kept: string[] = [];
  let quantityMultiplier = 1;

  for (const token of tokens) {
    const upper = stripAccents(token.toUpperCase()).replace(
      /[^A-Z0-9.,]/g,
      ""
    );
    if (!upper) continue;

    if (isNoiseQuantityToken(upper)) {
      const multiplier = extractMultiplier(upper);
      if (multiplier !== null && multiplier > 1 && multiplier <= 100) {
        quantityMultiplier = multiplier;
      }
      continue;
    }

    if (NOISE_TOKENS.has(upper)) continue;

    const expanded = ABBREVIATIONS[upper];
    kept.push(expanded ?? token.toLowerCase());
  }

  let name = kept.join(" ").trim();

  if (!name) {
    name = raw.trim();
  }

  const synonymKey = stripAccents(name.toLowerCase());
  if (SYNONYMS[synonymKey]) {
    name = SYNONYMS[synonymKey];
  } else {
    name = name.charAt(0).toUpperCase() + name.slice(1);
  }

  return { name, quantityMultiplier };
}
