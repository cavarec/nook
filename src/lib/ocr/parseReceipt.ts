import type { ParsedReceipt, ParsedReceiptItem } from "@/lib/types/domain";
import { normalizeProductLabel } from "@/lib/normalization/engine";
import { categorizeProduct } from "@/lib/categorization/engine";
import { stripAccents } from "@/lib/normalization/rules";

/**
 * Lignes a ignorer completement : TVA, totaux, moyens de paiement,
 * promotions, mentions administratives, en-tete magasin, section carte de
 * fidelite. Extensible sans toucher a la logique de parsing.
 */
const IGNORED_LINE_KEYWORDS = [
  "TVA",
  "TOTAL",
  "SOUS TOTAL",
  "SOUS-TOTAL",
  "MONTANT DU",
  "CB",
  "CARTE BANCAIRE",
  "CARTE BLEUE",
  "ESPECES",
  "CHEQUE",
  "MONNAIE",
  "RENDU",
  "A RENDRE",
  "REMISE",
  "PROMO",
  "PROMOTION",
  "TICKET DE CAISSE",
  "N CAISSE",
  "CAISSE N",
  "SIRET",
  "MERCI DE VOTRE VISITE",
  "MERCI DE VOTRE FIDELITE",
  "A BIENTOT",
  "DONT TVA",
  "NB ARTICLES",
  "NOMBRE D'ARTICLES",
  "VIGNETTE",
  "ELIGIBLE",
  // en-tete (adresse, horaires, telephone)
  "TEL :",
  "TEL:",
  "OUVERT DU",
  "LUNDI",
  "MARDI",
  "MERCREDI",
  "JEUDI",
  "VENDREDI",
  "SAMEDI",
  "DIMANCHE",
  // carte de fidelite / avantages
  "CARTE DE FIDELITE",
  "FIDELITE",
  "AVANTAGE",
  "SOLDE",
  "RECAPITULATIF",
  "MES AVANTAGES",
  "APPLI",
  "POUVOIR D ACHAT",
  "VER:",
  // adresse (types de voie courants)
  "BD ",
  "BOULEVARD",
  "RUE ",
  "AVENUE",
  "IMPASSE",
  "ALLEE",
  "CHEMIN DE",
  "ROUTE DE",
  "PLACE ",
];

/** Horaires d'ouverture : "8h45", "19h30". */
const HOUR_RANGE_PATTERN = /\d{1,2}\s*[Hh]\s*\d{0,2}/;

/** Nombre a virgule/point : prix, poids, etc. */
const DECIMAL_NUMBER_PATTERN = /-?\d+[.,]\d{2}/g;
const LEADING_QUANTITY_PATTERN = /^(\d+)\s*[xX]\s+/;
const DATE_PATTERN = /(\d{2})[/.-](\d{2})[/.-](\d{2,4})/;
/** Ligne de detail poids : "1,220 kg X 1,99EURO/kg" (suivie du prix). */
const WEIGHT_LINE_PATTERN = /^\d+[.,]\d+\s*kg\s*[xX]\s*\d+[.,]\d+\s*EUR/i;
/** Code postal + ville en tete de ticket : "29260 LESNEVEN". */
const POSTAL_CODE_LINE_PATTERN = /^\d{5}\s+\S/;
/** Numero de ticket / code caisse tout en majuscules+chiffres : "M10871 C018 O0004 T0046". */
const REGISTER_CODE_LINE_PATTERN = /^([A-Z]\d+\s*){2,}$/;
/** Ligne composee uniquement de chiffres (code-barres, reference). */
const DIGITS_ONLY_LINE_PATTERN = /^\d[\d\s]{9,}$/;

function isIgnoredLine(line: string): boolean {
  const normalized = stripAccents(line.toUpperCase());
  return IGNORED_LINE_KEYWORDS.some((keyword) =>
    normalized.includes(stripAccents(keyword))
  );
}

function isNoiseLine(line: string): boolean {
  const trimmed = line.trim();
  if (trimmed.length === 0) return true;
  // Lignes composees uniquement de separateurs / symboles.
  if (/^[-=*_.\s]+$/.test(trimmed)) return true;
  if (POSTAL_CODE_LINE_PATTERN.test(trimmed)) return true;
  if (REGISTER_CODE_LINE_PATTERN.test(trimmed)) return true;
  if (DIGITS_ONLY_LINE_PATTERN.test(trimmed)) return true;
  if (HOUR_RANGE_PATTERN.test(trimmed)) return true;
  return false;
}

/** Marque la fin de la liste d'articles (total, montant du). */
function isEndOfProductsLine(normalizedLine: string): boolean {
  if (normalizedLine.includes("MONTANT DU")) return true;
  if (normalizedLine.includes("TOTAL") && !normalizedLine.includes("SOUS")) {
    return true;
  }
  return false;
}

function parsePrice(raw: string): number {
  return parseFloat(raw.replace(",", "."));
}

/** Extrait le dernier nombre a 2 decimales de la ligne (le prix, meme suivi de "EUR A"). */
function extractLastPrice(line: string): { price: number; index: number } | null {
  const matches = [...line.matchAll(DECIMAL_NUMBER_PATTERN)];
  const last = matches[matches.length - 1];
  if (!last || last.index === undefined) return null;
  return { price: parsePrice(last[0]), index: last.index };
}

function parseDateToIso(raw: string, referenceYear: number): string | null {
  const match = DATE_PATTERN.exec(raw);
  if (!match) return null;
  const [, day, month, yearRaw] = match;
  if (!day || !month || !yearRaw) return null;
  const year =
    yearRaw.length === 2 ? 2000 + parseInt(yearRaw, 10) : parseInt(yearRaw, 10);
  const iso = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return null;
  if (parsed.getFullYear() < referenceYear - 5 || parsed.getFullYear() > referenceYear + 1) {
    return null;
  }
  return iso;
}

function parseProductLine(line: string): ParsedReceiptItem | null {
  let working = line.trim();

  let price: number | null = null;
  const priceMatch = extractLastPrice(working);
  if (priceMatch) {
    price = priceMatch.price;
    working = working.slice(0, priceMatch.index).trim();
  }

  let quantity = 1;
  const quantityMatch = LEADING_QUANTITY_PATTERN.exec(working);
  if (quantityMatch?.[1]) {
    quantity = parseInt(quantityMatch[1], 10);
    working = working.slice(quantityMatch[0].length).trim();
  }

  if (!working || working.length < 2) return null;

  const { name, quantityMultiplier } = normalizeProductLabel(working);
  const effectiveQuantity = quantity > 1 ? quantity : quantityMultiplier;

  return {
    rawLabel: line.trim(),
    normalizedName: name,
    category: categorizeProduct(name),
    quantity: effectiveQuantity,
    price,
  };
}

/**
 * Transforme le texte brut extrait par OCR/pdf.js en un ticket structure :
 * lignes produit detectees, TVA/total/paiement/promotions/en-tete/carte de
 * fidelite ignores. Gere aussi les articles vendus au poids etales sur
 * deux lignes ("PECHE PLATE VRAC" puis "0,430 kg X 1,99EURO/kg  0,86 EUR").
 */
export function parseReceiptText(
  rawText: string,
  now: Date = new Date()
): ParsedReceipt {
  const lines = rawText
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => !isNoiseLine(line));

  const storeName = lines[0] ?? null;

  let purchaseDate: string | null = null;
  let totalAmount: number | null = null;
  let inProductSection = true;
  let pendingItem: ParsedReceiptItem | null = null;
  const items: ParsedReceiptItem[] = [];

  function flushPending() {
    if (pendingItem) {
      items.push(pendingItem);
      pendingItem = null;
    }
  }

  // La premiere ligne (enseigne) ne contient jamais un produit.
  for (const line of lines.slice(1)) {
    if (!purchaseDate) {
      const foundDate = parseDateToIso(line, now.getFullYear());
      if (foundDate) {
        purchaseDate = foundDate;
        continue;
      }
    }

    const normalized = stripAccents(line.toUpperCase());

    if (inProductSection && isEndOfProductsLine(normalized)) {
      if (totalAmount === null) {
        const priceMatch = extractLastPrice(line);
        if (priceMatch) totalAmount = priceMatch.price;
      }
      flushPending();
      inProductSection = false;
      continue;
    }

    if (!inProductSection) continue;
    if (isIgnoredLine(line)) continue;

    if (WEIGHT_LINE_PATTERN.test(line.trim())) {
      if (pendingItem) {
        const priceMatch = extractLastPrice(line);
        if (priceMatch) pendingItem.price = priceMatch.price;
        items.push(pendingItem);
        pendingItem = null;
      }
      continue;
    }

    // Une ligne produit sans prix attend une eventuelle ligne de detail
    // poids qui suit ; si la ligne precedente n'en avait pas, on la valide
    // telle quelle avant de traiter la nouvelle ligne.
    flushPending();

    const item = parseProductLine(line);
    if (!item) continue;
    if (item.price === null) {
      pendingItem = item;
    } else {
      items.push(item);
    }
  }

  flushPending();

  return {
    storeName,
    purchaseDate: purchaseDate ?? now.toISOString().slice(0, 10),
    totalAmount,
    items,
  };
}
