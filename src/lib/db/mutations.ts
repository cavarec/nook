"use client";

import type {
  Category,
  CorrectionType,
  Product,
  Purchase,
  StockCorrection,
  Ticket,
} from "@/lib/types/domain";
import { getDb, queueMutation } from "./indexeddb";
import {
  toEstimatedStockRow,
  toProductRow,
  toPurchaseRow,
  toStockCorrectionRow,
  toTicketRow,
} from "./mappers";
import { computeProductInsight } from "@/lib/insights";
import { pushPendingMutations } from "./sync";

function newId(): string {
  return crypto.randomUUID();
}

function nowIso(): string {
  return new Date().toISOString();
}

const DEFAULT_SHELF_LIFE_DAYS: Partial<Record<Category, number>> = {
  Frais: 7,
  "Fruits & Legumes": 6,
};

export async function findOrCreateProduct(
  householdId: string,
  name: string,
  category: Category
): Promise<Product> {
  const db = getDb();
  const existing = await db.products
    .where("householdId")
    .equals(householdId)
    .filter((p) => p.name.toLowerCase() === name.toLowerCase())
    .first();
  if (existing) return existing;

  const product: Product = {
    id: newId(),
    householdId,
    name,
    category,
    brand: null,
    barcode: null,
    averageShelfLifeDays: DEFAULT_SHELF_LIFE_DAYS[category] ?? null,
    createdAt: nowIso(),
  };

  await db.products.put(product);
  await queueMutation({
    table: "products",
    operation: "insert",
    recordId: product.id,
    payload: toProductRow(product),
  });

  return product;
}

export async function createTicket(
  householdId: string,
  data: { storeName: string | null; purchaseDate: string; totalAmount: number | null }
): Promise<Ticket> {
  const db = getDb();
  const ticket: Ticket = {
    id: newId(),
    householdId,
    storeName: data.storeName,
    purchaseDate: data.purchaseDate,
    filePath: null,
    totalAmount: data.totalAmount,
    importedAt: nowIso(),
  };

  await db.tickets.put(ticket);
  await queueMutation({
    table: "tickets",
    operation: "insert",
    recordId: ticket.id,
    payload: toTicketRow(ticket),
  });

  return ticket;
}

export async function recordPurchase(
  householdId: string,
  productId: string,
  data: { quantity: number; purchaseDate: string; price: number | null; sourceTicketId: string | null }
): Promise<Purchase> {
  const db = getDb();
  const purchase: Purchase = {
    id: newId(),
    householdId,
    productId,
    quantity: data.quantity,
    purchaseDate: data.purchaseDate,
    price: data.price,
    sourceTicketId: data.sourceTicketId,
    createdAt: nowIso(),
  };

  await db.purchases.put(purchase);
  await queueMutation({
    table: "purchases",
    operation: "insert",
    recordId: purchase.id,
    payload: toPurchaseRow(purchase),
  });

  await recalculateAndCacheStock(householdId, productId);

  return purchase;
}

export async function addStockCorrection(
  householdId: string,
  productId: string,
  type: CorrectionType,
  createdBy: string | null
): Promise<StockCorrection> {
  const db = getDb();
  const correction: StockCorrection = {
    id: newId(),
    householdId,
    productId,
    type,
    createdBy,
    createdAt: nowIso(),
  };

  await db.stockCorrections.put(correction);
  await queueMutation({
    table: "stockCorrections",
    operation: "insert",
    recordId: correction.id,
    payload: toStockCorrectionRow(correction),
  });

  await recalculateAndCacheStock(householdId, productId);

  return correction;
}

/** Recalcule stock probable + confiance pour un produit et met le cache a jour. */
export async function recalculateAndCacheStock(
  householdId: string,
  productId: string
): Promise<void> {
  const db = getDb();
  const [product, purchases, corrections] = await Promise.all([
    db.products.get(productId),
    db.purchases.where("productId").equals(productId).toArray(),
    db.stockCorrections.where("productId").equals(productId).toArray(),
  ]);
  if (!product) return;

  const insight = computeProductInsight(product, purchases, corrections);
  const existing = await db.estimatedStock
    .where("productId")
    .equals(productId)
    .first();

  const record = {
    id: existing?.id ?? newId(),
    householdId,
    productId,
    estimatedQuantity: insight.estimatedQuantity,
    confidenceScore: insight.confidenceScore,
    lastCalculationDate: nowIso(),
  };

  await db.estimatedStock.put(record);
  await queueMutation({
    table: "estimatedStock",
    operation: "insert",
    recordId: record.id,
    payload: toEstimatedStockRow(record),
  });
}

/** Importe un ticket analyse : cree/retrouve chaque produit, enregistre les achats. */
export async function importParsedReceipt(
  householdId: string,
  parsed: {
    storeName: string | null;
    purchaseDate: string;
    totalAmount: number | null;
    items: { normalizedName: string; category: Category; quantity: number; price: number | null }[];
  }
): Promise<{ ticket: Ticket; itemCount: number }> {
  const ticket = await createTicket(householdId, {
    storeName: parsed.storeName,
    purchaseDate: parsed.purchaseDate,
    totalAmount: parsed.totalAmount,
  });

  for (const item of parsed.items) {
    const product = await findOrCreateProduct(
      householdId,
      item.normalizedName,
      item.category
    );
    await recordPurchase(householdId, product.id, {
      quantity: item.quantity,
      purchaseDate: parsed.purchaseDate,
      price: item.price,
      sourceTicketId: ticket.id,
    });
  }

  void pushPendingMutations();

  return { ticket, itemCount: parsed.items.length };
}
