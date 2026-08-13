import { describe, expect, it } from "vitest";
import { categorizeProduct } from "../engine";

describe("categorizeProduct", () => {
  it("categorizes fresh dairy products", () => {
    expect(categorizeProduct("Yaourts nature")).toBe("Frais");
  });

  it("categorizes fruits and vegetables", () => {
    expect(categorizeProduct("Banane bio")).toBe("Fruits & Legumes");
  });

  it("categorizes hygiene products", () => {
    expect(categorizeProduct("Déodorant")).toBe("Hygiene");
  });

  it("categorizes household cleaning products", () => {
    expect(categorizeProduct("Lessive liquide")).toBe("Entretien");
  });

  it("falls back to Maison for unknown products", () => {
    expect(categorizeProduct("Chose totalement inconnue")).toBe("Maison");
  });
});
