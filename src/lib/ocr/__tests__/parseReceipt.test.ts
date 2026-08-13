import { describe, expect, it } from "vitest";
import { parseReceiptText } from "../parseReceipt";

const SAMPLE_TICKET = `SUPERMARCHE DU COIN
12/03/2026
RAVI BF 2,50
MOUCH X10 1,95
LESS LIQ ECO 4,20
TVA 5,5% 0,45
TOTAL 8,65
CB 8,65
MERCI DE VOTRE VISITE`;

describe("parseReceiptText", () => {
  it("extracts the store name from the first line", () => {
    const result = parseReceiptText(SAMPLE_TICKET, new Date("2026-03-15"));
    expect(result.storeName).toBe("SUPERMARCHE DU COIN");
  });

  it("extracts the purchase date", () => {
    const result = parseReceiptText(SAMPLE_TICKET, new Date("2026-03-15"));
    expect(result.purchaseDate).toBe("2026-03-12");
  });

  it("extracts the total amount", () => {
    const result = parseReceiptText(SAMPLE_TICKET, new Date("2026-03-15"));
    expect(result.totalAmount).toBe(8.65);
  });

  it("ignores VAT, payment method and marketing lines", () => {
    const result = parseReceiptText(SAMPLE_TICKET, new Date("2026-03-15"));
    const labels = result.items.map((i) => i.normalizedName);
    expect(labels).not.toContain("Tva 5,5%");
    expect(result.items).toHaveLength(3);
  });

  it("normalizes and categorizes each detected product line", () => {
    const result = parseReceiptText(SAMPLE_TICKET, new Date("2026-03-15"));
    const ravioli = result.items.find((i) => i.normalizedName === "Raviolis");
    expect(ravioli).toBeDefined();
    expect(ravioli?.price).toBe(2.5);

    const mouchoirs = result.items.find(
      (i) => i.normalizedName === "Mouchoirs"
    );
    expect(mouchoirs?.quantity).toBe(10);

    const lessive = result.items.find(
      (i) => i.normalizedName === "Lessive liquide"
    );
    expect(lessive?.category).toBe("Entretien");
  });
});
