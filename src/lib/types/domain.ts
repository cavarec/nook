import type { Category, CorrectionType } from "./database";

export type { Category, CorrectionType };

export interface Product {
  id: string;
  householdId: string;
  name: string;
  category: Category;
  brand: string | null;
  barcode: string | null;
  averageShelfLifeDays: number | null;
  createdAt: string;
}

export interface Purchase {
  id: string;
  householdId: string;
  productId: string;
  quantity: number;
  purchaseDate: string;
  price: number | null;
  sourceTicketId: string | null;
  createdAt: string;
}

export interface Ticket {
  id: string;
  householdId: string;
  storeName: string | null;
  purchaseDate: string;
  filePath: string | null;
  totalAmount: number | null;
  importedAt: string;
}

export interface EstimatedStock {
  id: string;
  householdId: string;
  productId: string;
  estimatedQuantity: number;
  confidenceScore: number;
  lastCalculationDate: string;
}

export interface StockCorrection {
  id: string;
  householdId: string;
  productId: string;
  type: CorrectionType;
  createdBy: string | null;
  createdAt: string;
}

// ---------------------------------------------------------------------
// OCR / import
// ---------------------------------------------------------------------

export interface RawReceiptLine {
  raw: string;
  lineIndex: number;
}

export interface ParsedReceiptItem {
  rawLabel: string;
  normalizedName: string;
  category: Category;
  quantity: number;
  price: number | null;
}

export interface ParsedReceipt {
  storeName: string | null;
  purchaseDate: string;
  totalAmount: number | null;
  items: ParsedReceiptItem[];
}

// ---------------------------------------------------------------------
// Moteurs
// ---------------------------------------------------------------------

export interface PurchaseHistoryEntry {
  purchaseDate: string;
  quantity: number;
}

export interface StockEstimate {
  estimatedQuantity: number;
  averageIntervalDays: number | null;
  daysSinceLastPurchase: number;
}

export interface ConfidenceFactors {
  purchaseCount: number;
  averageIntervalDays: number | null;
  intervalStdDevDays: number | null;
  historyAgeDays: number;
  manualCorrectionCount: number;
  averageQuantity: number;
}

export type FreshnessStatus = "fresh" | "watch" | "urgent" | "unknown";

export interface FreshnessResult {
  status: FreshnessStatus;
  daysSincePurchase: number;
  daysRemaining: number | null;
}

export const PERISHABLE_CATEGORIES: Category[] = [
  "Frais",
  "Fruits & Legumes",
];

export const ALL_CATEGORIES: Category[] = [
  "Frais",
  "Fruits & Legumes",
  "Surgeles",
  "Epicerie",
  "Boissons",
  "Hygiene",
  "Entretien",
  "Bebe",
  "Animaux",
  "Bricolage",
  "Maison",
];
