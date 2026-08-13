import { describe, expect, it } from "vitest";
import { applyStockCorrections, estimateStock } from "../estimateStock";
import type { StockCorrection } from "@/lib/types/domain";

function correction(
  type: StockCorrection["type"],
  createdAt: string
): StockCorrection {
  return {
    id: `${type}-${createdAt}`,
    householdId: "h1",
    productId: "p1",
    type,
    createdBy: null,
    createdAt,
  };
}

describe("estimateStock", () => {
  it("returns zero stock with no history", () => {
    const result = estimateStock([]);
    expect(result.estimatedQuantity).toBe(0);
    expect(result.averageIntervalDays).toBeNull();
  });

  it("returns the last purchase quantity as-is with a single purchase", () => {
    const now = new Date("2026-01-10");
    const result = estimateStock(
      [{ purchaseDate: "2026-01-01", quantity: 3 }],
      now
    );
    expect(result.estimatedQuantity).toBe(3);
    expect(result.averageIntervalDays).toBeNull();
    expect(result.daysSinceLastPurchase).toBe(9);
  });

  it("depletes stock over time based on average consumption", () => {
    // Bought monthly, 1 unit each time. 30 days after the last purchase,
    // roughly a full unit should have been consumed.
    const now = new Date("2026-04-01");
    const result = estimateStock(
      [
        { purchaseDate: "2026-01-01", quantity: 1 },
        { purchaseDate: "2026-02-01", quantity: 1 },
        { purchaseDate: "2026-03-02", quantity: 1 },
      ],
      now
    );
    expect(result.averageIntervalDays).toBeGreaterThan(28);
    expect(result.estimatedQuantity).toBeLessThan(1);
    expect(result.estimatedQuantity).toBeGreaterThanOrEqual(0);
  });

  it("never returns a negative estimate", () => {
    const now = new Date("2026-06-01");
    const result = estimateStock(
      [
        { purchaseDate: "2026-01-01", quantity: 1 },
        { purchaseDate: "2026-01-08", quantity: 1 },
      ],
      now
    );
    expect(result.estimatedQuantity).toBe(0);
  });
});

describe("applyStockCorrections", () => {
  it("returns the base quantity unchanged when there are no corrections", () => {
    expect(applyStockCorrections(3, "2026-01-01", [])).toBe(3);
  });

  it("adds one for each increment after the last purchase", () => {
    const corrections = [
      correction("increment", "2026-01-05T10:00:00Z"),
      correction("increment", "2026-01-06T10:00:00Z"),
    ];
    expect(applyStockCorrections(1, "2026-01-01", corrections)).toBe(3);
  });

  it("subtracts one for each decrement, never going below zero", () => {
    const corrections = [
      correction("decrement", "2026-01-05T10:00:00Z"),
      correction("decrement", "2026-01-06T10:00:00Z"),
    ];
    expect(applyStockCorrections(1, "2026-01-01", corrections)).toBe(0);
  });

  it("forces the quantity to zero on 'finished'", () => {
    const corrections = [correction("finished", "2026-01-05T10:00:00Z")];
    expect(applyStockCorrections(5, "2026-01-01", corrections)).toBe(0);
  });

  it("bumps a near-zero estimate up to at least 1 on 'still_available'", () => {
    const corrections = [correction("still_available", "2026-01-05T10:00:00Z")];
    expect(applyStockCorrections(0.2, "2026-01-01", corrections)).toBe(1);
  });

  it("ignores corrections made before the most recent purchase", () => {
    const corrections = [correction("finished", "2025-12-01T10:00:00Z")];
    expect(applyStockCorrections(2, "2026-01-01", corrections)).toBe(2);
  });

  it("applies corrections in chronological order", () => {
    const corrections = [
      correction("increment", "2026-01-07T10:00:00Z"),
      correction("finished", "2026-01-05T10:00:00Z"),
    ];
    // finished (Jan 5) happens before increment (Jan 7): ends at 0 + 1 = 1.
    expect(applyStockCorrections(5, "2026-01-01", corrections)).toBe(1);
  });
});
