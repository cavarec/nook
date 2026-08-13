import Dexie, { type EntityTable } from "dexie";
import type {
  EstimatedStock,
  Product,
  Purchase,
  StockCorrection,
  Ticket,
} from "@/lib/types/domain";

export type MutationTable =
  | "products"
  | "purchases"
  | "tickets"
  | "estimatedStock"
  | "stockCorrections";

export type MutationOperation = "insert" | "update" | "delete";

export interface PendingMutation {
  id?: number;
  table: MutationTable;
  operation: MutationOperation;
  recordId: string;
  payload: unknown;
  createdAt: string;
}

/**
 * Base locale offline-first. Source de verite quand l'appareil est hors
 * ligne ; synchronisee vers Supabase des le retour du reseau (voir sync.ts).
 */
class NookDatabase extends Dexie {
  products!: EntityTable<Product, "id">;
  purchases!: EntityTable<Purchase, "id">;
  tickets!: EntityTable<Ticket, "id">;
  estimatedStock!: EntityTable<EstimatedStock, "id">;
  stockCorrections!: EntityTable<StockCorrection, "id">;
  pendingMutations!: EntityTable<PendingMutation, "id">;

  constructor() {
    super("nook");

    this.version(1).stores({
      products: "id, householdId, category, name",
      purchases: "id, householdId, productId, purchaseDate",
      tickets: "id, householdId, purchaseDate",
      estimatedStock: "id, householdId, productId",
      stockCorrections: "id, householdId, productId, createdAt",
      pendingMutations: "++id, table, createdAt",
    });
  }
}

let dbInstance: NookDatabase | null = null;

/** Instancie la base uniquement cote navigateur (IndexedDB n'existe pas en SSR). */
export function getDb(): NookDatabase {
  if (typeof window === "undefined") {
    throw new Error("getDb() must only be called in the browser");
  }
  if (!dbInstance) {
    dbInstance = new NookDatabase();
  }
  return dbInstance;
}

export async function queueMutation(
  mutation: Omit<PendingMutation, "id" | "createdAt">
): Promise<void> {
  const db = getDb();
  await db.pendingMutations.add({
    ...mutation,
    createdAt: new Date().toISOString(),
  });
}
