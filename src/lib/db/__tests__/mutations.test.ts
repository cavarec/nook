// @vitest-environment jsdom
import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it } from "vitest";
import { findOrCreateProduct, recordPurchase } from "../mutations";
import { getDb } from "../indexeddb";

const HOUSEHOLD_ID = "household-1";

beforeEach(async () => {
  const db = getDb();
  await Promise.all([
    db.products.clear(),
    db.purchases.clear(),
    db.pendingMutations.clear(),
    db.estimatedStock.clear(),
    db.stockCorrections.clear(),
  ]);
});

describe("findOrCreateProduct — regroupement par famille", () => {
  it("reuses the same product across differently-worded receipts for the same family", async () => {
    const first = await findOrCreateProduct(
      HOUSEHOLD_ID,
      "Odnv 6oeuf ppa g ele",
      "Frais"
    );
    const second = await findOrCreateProduct(
      HOUSEHOLD_ID,
      "Oeufs bio x6",
      "Frais"
    );

    expect(second.id).toBe(first.id);
    expect(first.name).toBe("Œufs");

    const db = getDb();
    const allProducts = await db.products
      .where("householdId")
      .equals(HOUSEHOLD_ID)
      .toArray();
    expect(allProducts).toHaveLength(1);
  });

  it("accumulates purchase history under the shared family product", async () => {
    const day1 = await findOrCreateProduct(
      HOUSEHOLD_ID,
      "Odnv 6oeuf ppa g ele",
      "Frais"
    );
    await recordPurchase(HOUSEHOLD_ID, day1.id, {
      quantity: 1,
      purchaseDate: "2026-07-01",
      price: 1.77,
      sourceTicketId: null,
    });

    const day2 = await findOrCreateProduct(
      HOUSEHOLD_ID,
      "Oeufs bio x6",
      "Frais"
    );
    await recordPurchase(HOUSEHOLD_ID, day2.id, {
      quantity: 1,
      purchaseDate: "2026-07-25",
      price: 2.1,
      sourceTicketId: null,
    });

    const db = getDb();
    const purchases = await db.purchases
      .where("productId")
      .equals(day1.id)
      .toArray();
    expect(purchases).toHaveLength(2);
  });

  it("keeps unrecognized products separate when names differ exactly", async () => {
    const a = await findOrCreateProduct(HOUSEHOLD_ID, "Tipiak coq stj norma", "Maison");
    const b = await findOrCreateProduct(HOUSEHOLD_ID, "La genereuse pc/300g", "Maison");
    expect(a.id).not.toBe(b.id);
  });

  it("still dedupes by exact name when no family is recognized", async () => {
    const a = await findOrCreateProduct(HOUSEHOLD_ID, "Tipiak coq stj norma", "Maison");
    const b = await findOrCreateProduct(HOUSEHOLD_ID, "Tipiak coq stj norma", "Maison");
    expect(a.id).toBe(b.id);
  });
});
