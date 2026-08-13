import { createClient } from "@/lib/supabase/client";
import { getDb, type PendingMutation } from "./indexeddb";

const TABLE_MAP = {
  products: "products",
  purchases: "purchases",
  tickets: "tickets",
  estimatedStock: "estimated_stock",
  stockCorrections: "stock_corrections",
} as const;

export function isOnline(): boolean {
  return typeof navigator === "undefined" ? true : navigator.onLine;
}

async function pushMutation(mutation: PendingMutation): Promise<boolean> {
  const supabase = createClient();
  const table = TABLE_MAP[mutation.table];

  try {
    if (mutation.operation === "delete") {
      const { error } = await supabase
        .from(table)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .delete()
        .eq("id", mutation.recordId);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from(table)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .upsert(mutation.payload as any);
      if (error) throw error;
    }
    return true;
  } catch (error) {
    console.error(`[sync] failed to push mutation for ${table}`, error);
    return false;
  }
}

/** Rejoue la file de mutations en attente, dans l'ordre, en s'arretant a la premiere erreur. */
export async function pushPendingMutations(): Promise<void> {
  if (!isOnline()) return;
  const db = getDb();
  const pending = await db.pendingMutations.orderBy("createdAt").toArray();

  for (const mutation of pending) {
    const success = await pushMutation(mutation);
    if (!success) break;
    if (mutation.id !== undefined) {
      await db.pendingMutations.delete(mutation.id);
    }
  }
}

/** Recupere les dernieres donnees du foyer depuis Supabase et les met en cache local. */
export async function pullHouseholdData(householdId: string): Promise<void> {
  if (!isOnline()) return;
  const supabase = createClient();
  const db = getDb();

  const [products, purchases, tickets, estimatedStock, stockCorrections] =
    await Promise.all([
      supabase.from("products").select("*").eq("household_id", householdId),
      supabase.from("purchases").select("*").eq("household_id", householdId),
      supabase.from("tickets").select("*").eq("household_id", householdId),
      supabase
        .from("estimated_stock")
        .select("*")
        .eq("household_id", householdId),
      supabase
        .from("stock_corrections")
        .select("*")
        .eq("household_id", householdId),
    ]);

  if (products.data) {
    await db.products.bulkPut(
      products.data.map((p) => ({
        id: p.id,
        householdId: p.household_id,
        name: p.name,
        category: p.category,
        brand: p.brand,
        barcode: p.barcode,
        averageShelfLifeDays: p.average_shelf_life_days,
        createdAt: p.created_at,
      }))
    );
  }

  if (purchases.data) {
    await db.purchases.bulkPut(
      purchases.data.map((p) => ({
        id: p.id,
        householdId: p.household_id,
        productId: p.product_id,
        quantity: p.quantity,
        purchaseDate: p.purchase_date,
        price: p.price,
        sourceTicketId: p.source_ticket_id,
        createdAt: p.created_at,
      }))
    );
  }

  if (tickets.data) {
    await db.tickets.bulkPut(
      tickets.data.map((t) => ({
        id: t.id,
        householdId: t.household_id,
        storeName: t.store_name,
        purchaseDate: t.purchase_date,
        filePath: t.file_path,
        totalAmount: t.total_amount,
        importedAt: t.imported_at,
      }))
    );
  }

  if (estimatedStock.data) {
    await db.estimatedStock.bulkPut(
      estimatedStock.data.map((s) => ({
        id: s.id,
        householdId: s.household_id,
        productId: s.product_id,
        estimatedQuantity: s.estimated_quantity,
        confidenceScore: s.confidence_score,
        lastCalculationDate: s.last_calculation_date,
      }))
    );
  }

  if (stockCorrections.data) {
    await db.stockCorrections.bulkPut(
      stockCorrections.data.map((c) => ({
        id: c.id,
        householdId: c.household_id,
        productId: c.product_id,
        type: c.type,
        createdBy: c.created_by,
        createdAt: c.created_at,
      }))
    );
  }
}

/** A appeler au retour du reseau : vide la file de mutations puis rafraichit le cache local. */
export async function syncWithSupabase(householdId: string): Promise<void> {
  await pushPendingMutations();
  await pullHouseholdData(householdId);
}
