import { describe, expect, it } from "vitest";
import { estimateStock } from "../estimateStock";

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
