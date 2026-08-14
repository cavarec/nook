import { describe, expect, it } from "vitest";
import { resolveProductFamily } from "../productFamily";

describe("resolveProductFamily", () => {
  it("groups differently-worded eggs under the same family", () => {
    expect(resolveProductFamily("Odnv 6oeuf ppa g ele")).toBe("Œufs");
    expect(resolveProductFamily("Oeufs bio x6")).toBe("Œufs");
    expect(resolveProductFamily("6 oeufs frais")).toBe("Œufs");
  });

  it("recognizes coffee, laundry detergent and tissues", () => {
    expect(resolveProductFamily("Café moulu Carte Noire")).toBe("Café");
    expect(resolveProductFamily("Lessive liquide")).toBe("Lessive");
    expect(resolveProductFamily("Mouchoirs")).toBe("Mouchoirs");
  });

  it("does not confuse potatoes with apples", () => {
    expect(resolveProductFamily("Pommes de terre primeur")).toBe(
      "Pommes de terre"
    );
    expect(resolveProductFamily("Pommes golden")).toBe("Pommes");
  });

  it("returns null for names with no recognized family", () => {
    expect(resolveProductFamily("Tipiak coq stj norma")).toBeNull();
    expect(resolveProductFamily("La genereuse pc/300g")).toBeNull();
  });
});
