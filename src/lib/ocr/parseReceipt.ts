import type { ParsedReceipt, ParsedReceiptItem } from "@/lib/types/domain";
import { normalizeProductLabel } from "@/lib/normalization/engine";
import { categorizeProduct } from "@/lib/categorization/engine";
import { stripAccents } from "@/lib/normalization/rules";

/**
 * Lignes a ignorer completement : TVA, totaux, moyens de paiement,
 * promotions, mentions administratives. Extensible sans toucher a la
 * logique de parsing.
 */
const IGNORED_LINE_KEYWORDS = [
  "TVA",
  "TOTAL",
  "SOUS TOTAL",
  "SOUS-TOTAL",
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
  "A BIENTOT",
  "DONT TVA",
  "NB ARTICLES",
];

const PRICE_PATTERN = /(-?\d+[.,]\d{2})\s*€?\s*$/;
const LEADING_QUANTITY_PATTERN = /^(\d+)\s*[xX]\s+/;
const DATE_PATTERN = /(\d{2})[/.-](\d{2})[/.-](\d{2,4})/;

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
  return false;
}

function parsePrice(raw: string): number {
  return parseFloat(raw.replace(",", "."));
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
  const priceMatch = PRICE_PATTERN.exec(working);
  if (priceMatch?.[1]) {
    price = parsePrice(priceMatch[1]);
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
 * lignes produit detectees, TVA/total/paiement/promotions ignores.
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
  const items: ParsedReceiptItem[] = [];

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
    if (normalized.includes("TOTAL") && !normalized.includes("SOUS")) {
      const priceMatch = PRICE_PATTERN.exec(line);
      if (priceMatch?.[1]) {
        totalAmount = parsePrice(priceMatch[1]);
      }
      continue;
    }

    if (isIgnoredLine(line)) continue;

    const item = parseProductLine(line);
    if (item) items.push(item);
  }

  return {
    storeName,
    purchaseDate: purchaseDate ?? now.toISOString().slice(0, 10),
    totalAmount,
    items,
  };
}
