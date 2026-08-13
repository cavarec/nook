import { describe, expect, it } from "vitest";
import { normalizeProductLabel } from "../engine";

describe("normalizeProductLabel", () => {
  it("expands abbreviations and drops noise tokens", () => {
    expect(normalizeProductLabel("LESS LIQ ECO").name).toBe("Lessive liquide");
  });

  it("expands a single abbreviation and drops a brand-code token", () => {
    expect(normalizeProductLabel("RAVI BF").name).toBe("Raviolis");
  });

  it("expands an abbreviation and drops a quantity token", () => {
    const result = normalizeProductLabel("MOUCH X10");
    expect(result.name).toBe("Mouchoirs");
    expect(result.quantityMultiplier).toBe(10);
  });

  it("falls back to the raw label when everything is filtered out", () => {
    expect(normalizeProductLabel("X10").name).toBe("X10");
  });

  it("applies synonyms after normalization", () => {
    expect(normalizeProductLabel("CAF").name).toBe("Café");
  });

  it("capitalizes unknown words without crashing", () => {
    expect(normalizeProductLabel("banane bio").name).toBe("Banane bio");
  });

  it("defaults the multiplier to 1 when no quantity token is present", () => {
    expect(normalizeProductLabel("YAO NATURE").quantityMultiplier).toBe(1);
  });
});
