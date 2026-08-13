import { describe, expect, it } from "vitest";
import { calculatePotentialWasteValue, computeFreshness } from "../freshnessEngine";

describe("computeFreshness", () => {
  it("returns unknown when no shelf life is known", () => {
    const result = computeFreshness("2026-08-01", null, new Date("2026-08-05"));
    expect(result.status).toBe("unknown");
    expect(result.daysRemaining).toBeNull();
  });

  it("marks a just-bought perishable as fresh", () => {
    const result = computeFreshness("2026-08-05", 10, new Date("2026-08-06"));
    expect(result.status).toBe("fresh");
  });

  it("marks a product nearing end of shelf life as watch", () => {
    const result = computeFreshness("2026-08-01", 10, new Date("2026-08-08"));
    expect(result.status).toBe("watch");
  });

  it("marks an expired product as urgent", () => {
    const result = computeFreshness("2026-08-01", 5, new Date("2026-08-08"));
    expect(result.status).toBe("urgent");
    expect(result.daysRemaining).toBeLessThan(0);
  });
});

describe("calculatePotentialWasteValue", () => {
  it("sums urgent items fully and watch items at half weight", () => {
    const total = calculatePotentialWasteValue([
      { status: "urgent", price: 4 },
      { status: "watch", price: 2 },
      { status: "fresh", price: 10 },
      { status: "unknown", price: null },
    ]);
    expect(total).toBe(5);
  });

  it("returns 0 for an empty list", () => {
    expect(calculatePotentialWasteValue([])).toBe(0);
  });
});
