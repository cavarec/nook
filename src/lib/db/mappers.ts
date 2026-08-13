import type {
  EstimatedStock,
  Product,
  Purchase,
  StockCorrection,
  Ticket,
} from "@/lib/types/domain";
import type { Database } from "@/lib/types/database";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];
type PurchaseRow = Database["public"]["Tables"]["purchases"]["Row"];
type TicketRow = Database["public"]["Tables"]["tickets"]["Row"];
type EstimatedStockRow = Database["public"]["Tables"]["estimated_stock"]["Row"];
type StockCorrectionRow = Database["public"]["Tables"]["stock_corrections"]["Row"];

export function toProductRow(p: Product): ProductRow {
  return {
    id: p.id,
    household_id: p.householdId,
    name: p.name,
    category: p.category,
    brand: p.brand,
    barcode: p.barcode,
    average_shelf_life_days: p.averageShelfLifeDays,
    created_at: p.createdAt,
  };
}

export function toPurchaseRow(p: Purchase): PurchaseRow {
  return {
    id: p.id,
    household_id: p.householdId,
    product_id: p.productId,
    quantity: p.quantity,
    purchase_date: p.purchaseDate,
    price: p.price,
    source_ticket_id: p.sourceTicketId,
    created_at: p.createdAt,
  };
}

export function toTicketRow(t: Ticket): TicketRow {
  return {
    id: t.id,
    household_id: t.householdId,
    store_name: t.storeName,
    purchase_date: t.purchaseDate,
    file_path: t.filePath,
    total_amount: t.totalAmount,
    imported_at: t.importedAt,
  };
}

export function toEstimatedStockRow(s: EstimatedStock): EstimatedStockRow {
  return {
    id: s.id,
    household_id: s.householdId,
    product_id: s.productId,
    estimated_quantity: s.estimatedQuantity,
    confidence_score: s.confidenceScore,
    last_calculation_date: s.lastCalculationDate,
  };
}

export function toStockCorrectionRow(c: StockCorrection): StockCorrectionRow {
  return {
    id: c.id,
    household_id: c.householdId,
    product_id: c.productId,
    type: c.type,
    created_by: c.createdBy,
    created_at: c.createdAt,
  };
}
