import type { Product, Purchase, StockCorrection } from "@/lib/types/domain";
import { estimateStock } from "@/lib/stock/estimateStock";
import { buildConfidenceFactors, scoreConfidence } from "@/lib/confidence/scoreConfidence";
import { computeFreshness } from "@/lib/waste/freshnessEngine";
import { PERISHABLE_CATEGORIES } from "@/lib/types/domain";

export interface ProductInsight {
  product: Product;
  estimatedQuantity: number;
  confidenceScore: number;
  lastPurchaseDate: string | null;
  daysSinceLastPurchase: number;
  freshnessStatus: ReturnType<typeof computeFreshness>["status"] | null;
}

/** Compose les moteurs stock + confiance (+ fraicheur si perissable) pour un produit. */
export function computeProductInsight(
  product: Product,
  purchases: Purchase[],
  corrections: StockCorrection[],
  now: Date = new Date()
): ProductInsight {
  const productPurchases = purchases.filter((p) => p.productId === product.id);
  const productCorrections = corrections.filter(
    (c) => c.productId === product.id
  );

  const history = productPurchases.map((p) => ({
    purchaseDate: p.purchaseDate,
    quantity: p.quantity,
  }));

  const estimate = estimateStock(history, now);
  const factors = buildConfidenceFactors(
    history,
    productCorrections.length,
    now
  );
  const confidenceScore = scoreConfidence(factors);

  const sortedPurchases = [...productPurchases].sort(
    (a, b) =>
      new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime()
  );
  const lastPurchase = sortedPurchases[0] ?? null;

  const isPerishable = PERISHABLE_CATEGORIES.includes(product.category);
  const freshnessStatus =
    isPerishable && lastPurchase
      ? computeFreshness(
          lastPurchase.purchaseDate,
          product.averageShelfLifeDays,
          now
        ).status
      : null;

  return {
    product,
    estimatedQuantity: estimate.estimatedQuantity,
    confidenceScore,
    lastPurchaseDate: lastPurchase?.purchaseDate ?? null,
    daysSinceLastPurchase: estimate.daysSinceLastPurchase,
    freshnessStatus,
  };
}
