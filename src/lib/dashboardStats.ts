import type { Product, Purchase } from "@/lib/types/domain";
import { estimateStock } from "@/lib/stock/estimateStock";
import { mean } from "@/lib/stock/stats";

export interface ProductPurchaseSummary {
  product: Product;
  purchaseCount: number;
  totalQuantity: number;
  averagePrice: number | null;
  estimatedQuantity: number;
  estimatedValue: number;
}

export interface DashboardStats {
  estimatedStockValue: number;
  trackedProductCount: number;
  topPurchased: ProductPurchaseSummary[];
  mostConsumed: ProductPurchaseSummary[];
  frequentDuplicates: ProductPurchaseSummary[];
  estimatedSavings: number;
}

const DUPLICATE_WINDOW_DAYS = 7;

function summarizeProduct(
  product: Product,
  purchases: Purchase[],
  now: Date
): ProductPurchaseSummary {
  const productPurchases = purchases.filter((p) => p.productId === product.id);
  const prices = productPurchases
    .map((p) => p.price)
    .filter((p): p is number => p !== null);
  const averagePrice = prices.length > 0 ? mean(prices) : null;

  const estimate = estimateStock(
    productPurchases.map((p) => ({
      purchaseDate: p.purchaseDate,
      quantity: p.quantity,
    })),
    now
  );

  return {
    product,
    purchaseCount: productPurchases.length,
    totalQuantity: productPurchases.reduce((sum, p) => sum + p.quantity, 0),
    averagePrice,
    estimatedQuantity: estimate.estimatedQuantity,
    estimatedValue: averagePrice ? averagePrice * estimate.estimatedQuantity : 0,
  };
}

/** Compte les achats du meme produit survenus a moins de 7 jours d'intervalle. */
function countLikelyDuplicatePurchases(purchases: Purchase[]): number {
  const sorted = [...purchases].sort(
    (a, b) => new Date(a.purchaseDate).getTime() - new Date(b.purchaseDate).getTime()
  );
  let count = 0;
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];
    if (!prev || !curr) continue;
    const days =
      (new Date(curr.purchaseDate).getTime() - new Date(prev.purchaseDate).getTime()) /
      (1000 * 60 * 60 * 24);
    if (days <= DUPLICATE_WINDOW_DAYS) count += 1;
  }
  return count;
}

export function computeDashboardStats(
  products: Product[],
  purchases: Purchase[],
  now: Date = new Date()
): DashboardStats {
  const summaries = products.map((p) => summarizeProduct(p, purchases, now));

  const estimatedStockValue = Math.round(
    summaries.reduce((sum, s) => sum + s.estimatedValue, 0) * 100
  ) / 100;

  const topPurchased = [...summaries]
    .sort((a, b) => b.totalQuantity - a.totalQuantity)
    .slice(0, 5);

  const mostConsumed = [...summaries]
    .sort((a, b) => b.purchaseCount - a.purchaseCount)
    .slice(0, 5);

  const withDuplicates = summaries
    .map((s) => ({
      summary: s,
      duplicateCount: countLikelyDuplicatePurchases(
        purchases.filter((p) => p.productId === s.product.id)
      ),
    }))
    .filter((s) => s.duplicateCount > 0)
    .sort((a, b) => b.duplicateCount - a.duplicateCount);

  const frequentDuplicates = withDuplicates.slice(0, 5).map((s) => s.summary);

  const estimatedSavings = Math.round(
    withDuplicates.reduce((sum, s) => {
      const price = s.summary.averagePrice ?? 0;
      return sum + price * s.duplicateCount;
    }, 0) * 100
  ) / 100;

  return {
    estimatedStockValue,
    trackedProductCount: products.length,
    topPurchased,
    mostConsumed,
    frequentDuplicates,
    estimatedSavings,
  };
}
