import { describe, expect, it } from "vitest";
import { buildConfidenceFactors, scoreConfidence } from "../scoreConfidence";

describe("scoreConfidence", () => {
  it("returns 0 for a product with no history", () => {
    const factors = buildConfidenceFactors([], 0);
    expect(scoreConfidence(factors)).toBe(0);
  });

  it("scores a frequent, regular, long-standing product highly", () => {
    const now = new Date("2026-07-01");
    const history = [
      { purchaseDate: "2026-01-01", quantity: 2 },
      { purchaseDate: "2026-02-01", quantity: 2 },
      { purchaseDate: "2026-03-01", quantity: 2 },
      { purchaseDate: "2026-04-01", quantity: 2 },
      { purchaseDate: "2026-05-01", quantity: 2 },
      { purchaseDate: "2026-06-01", quantity: 2 },
    ];
    const factors = buildConfidenceFactors(history, 2, now);
    const score = scoreConfidence(factors);
    expect(score).toBeGreaterThan(0.7);
  });

  it("scores a rarely purchased product lower than a frequent one", () => {
    const now = new Date("2026-07-01");
    const rare = buildConfidenceFactors(
      [{ purchaseDate: "2026-06-15", quantity: 1 }],
      0,
      now
    );
    const frequent = buildConfidenceFactors(
      [
        { purchaseDate: "2026-01-01", quantity: 2 },
        { purchaseDate: "2026-02-01", quantity: 2 },
        { purchaseDate: "2026-03-01", quantity: 2 },
        { purchaseDate: "2026-04-01", quantity: 2 },
      ],
      0,
      now
    );
    expect(scoreConfidence(rare)).toBeLessThan(scoreConfidence(frequent));
  });

  it("increases with manual corrections", () => {
    const now = new Date("2026-07-01");
    const history = [
      { purchaseDate: "2026-05-01", quantity: 1 },
      { purchaseDate: "2026-06-01", quantity: 1 },
    ];
    const withoutCorrections = scoreConfidence(
      buildConfidenceFactors(history, 0, now)
    );
    const withCorrections = scoreConfidence(
      buildConfidenceFactors(history, 5, now)
    );
    expect(withCorrections).toBeGreaterThan(withoutCorrections);
  });

  it("never exceeds 1 or drops below 0", () => {
    const now = new Date("2026-07-01");
    const history = Array.from({ length: 20 }, (_, i) => ({
      purchaseDate: `2026-01-${String((i % 27) + 1).padStart(2, "0")}`,
      quantity: 10,
    }));
    const score = scoreConfidence(buildConfidenceFactors(history, 20, now));
    expect(score).toBeLessThanOrEqual(1);
    expect(score).toBeGreaterThanOrEqual(0);
  });
});
