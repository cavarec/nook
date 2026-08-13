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

// Reconstitue un extrait representatif d'un vrai ticket Intermarche (texte
// deja recompose ligne par ligne comme le fait extractTextFromPdf) : en-tete
// magasin sur plusieurs lignes, prix suivis de "EUR A", article vendu au
// poids etale sur deux lignes, marqueur "MONTANT DU" (pas "TOTAL"), section
// carte de fidelite/TVA en pied de ticket, date tout a la fin.
const REAL_WORLD_TICKET = `Intermarché
BD DES FRERES LUMIERE
29260 LESNEVEN
TEL : 02.98.83.80.00
Ouvert du Lundi au Samedi
de 8h45 à 19:30
SIRET: 97864947300029
NUTELLA PATE TARTINE 2,54 EUR A
PDT PRIMEUR VRAC
1,220 kg X 1,99EURO/kg 2,43 EUR A
MELON PIECE 2,29 EUR A
MONTANT DU 58,26 EUR
CB EMV 58,26 EUR
Nombre d'articles vendus= 21
RECAPITULATIF TVA
CARTE DE FIDELITE 3250390100431138951
MES AVANTAGES CARTE
AVANTAGE FRUITS ET LEGUMES
LEGUMES FRAIS 0,49
NOUVEAU SOLDE 4,05
12:49:53 25/07/2026
M10871 C018 O0004 T0046
MERCI DE VOTRE FIDELITE.A BIENTOT
202607251249004601810871`;

describe("parseReceiptText — real-world PDF ticket", () => {
  it("extracts every product line despite the multi-line store header", () => {
    const result = parseReceiptText(REAL_WORLD_TICKET, new Date("2026-07-25"));
    expect(result.items.map((i) => i.rawLabel)).toEqual([
      "NUTELLA PATE TARTINE 2,54 EUR A",
      "PDT PRIMEUR VRAC",
      "MELON PIECE 2,29 EUR A",
    ]);
  });

  it("strips trailing 'EUR A' VAT-code suffixes from the price", () => {
    const result = parseReceiptText(REAL_WORLD_TICKET, new Date("2026-07-25"));
    const melon = result.items.find((i) => i.rawLabel.startsWith("MELON"));
    expect(melon?.price).toBe(2.29);
  });

  it("merges a weight-priced item split across two lines", () => {
    const result = parseReceiptText(REAL_WORLD_TICKET, new Date("2026-07-25"));
    const pdt = result.items.find((i) => i.rawLabel.startsWith("PDT"));
    expect(pdt?.price).toBe(2.43);
  });

  it("stops collecting items at MONTANT DU and captures it as the total", () => {
    const result = parseReceiptText(REAL_WORLD_TICKET, new Date("2026-07-25"));
    expect(result.totalAmount).toBe(58.26);
    expect(result.items).toHaveLength(3);
  });

  it("ignores the loyalty card / TVA recap section entirely", () => {
    const result = parseReceiptText(REAL_WORLD_TICKET, new Date("2026-07-25"));
    const labels = result.items.map((i) => i.rawLabel);
    expect(labels.some((l) => l.includes("LEGUMES FRAIS"))).toBe(false);
  });

  it("still finds the purchase date even after the loyalty section", () => {
    const result = parseReceiptText(REAL_WORLD_TICKET, new Date("2026-07-25"));
    expect(result.purchaseDate).toBe("2026-07-25");
  });
});
