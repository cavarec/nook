"use client";

import type { TextItem } from "pdfjs-dist/types/src/display/api";
import type { OcrProgress } from "./extractText";

const SAME_LINE_Y_TOLERANCE = 2;

/**
 * pdf.js ne rend pas les items de texte dans l'ordre visuel ni avec des
 * sauts de ligne : chaque item porte juste sa position (x, y). On
 * reconstitue les lignes en groupant les items par position verticale
 * proche, puis en les triant de gauche a droite au sein de chaque ligne.
 */
function reconstructLines(items: TextItem[]): string {
  const sorted = [...items].sort((a, b) => {
    const dy = b.transform[5] - a.transform[5];
    if (Math.abs(dy) > SAME_LINE_Y_TOLERANCE) return dy;
    return a.transform[4] - b.transform[4];
  });

  const lines: string[] = [];
  let currentLine: string[] = [];
  let currentY: number | null = null;

  for (const item of sorted) {
    const y = item.transform[5];
    if (currentY === null || Math.abs(y - currentY) <= SAME_LINE_Y_TOLERANCE) {
      currentLine.push(item.str);
      currentY ??= y;
    } else {
      lines.push(currentLine.join(" ").replace(/\s+/g, " ").trim());
      currentLine = [item.str];
      currentY = y;
    }
  }
  if (currentLine.length > 0) {
    lines.push(currentLine.join(" ").replace(/\s+/g, " ").trim());
  }

  return lines.filter(Boolean).join("\n");
}

/**
 * Extrait le texte d'un PDF. Si le PDF contient du texte embarque
 * (facture generee), on le lit directement via pdf.js. Sinon (ticket
 * scanne/photographie en PDF), chaque page est rendue en image et passee
 * a l'OCR Tesseract.js.
 */
export async function extractTextFromPdf(
  file: File,
  onProgress?: (progress: OcrProgress) => void
): Promise<string> {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let embeddedText = "";
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const items = textContent.items.filter(
      (item): item is TextItem => "str" in item && item.str.trim().length > 0
    );
    embeddedText += `${reconstructLines(items)}\n`;
  }

  if (embeddedText.trim().length > 20) {
    return embeddedText;
  }

  const { extractTextFromImage } = await import("./extractText");
  let ocrText = "";
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const context = canvas.getContext("2d");
    if (!context) continue;
    await page.render({ canvasContext: context, viewport }).promise;
    ocrText += `${await extractTextFromImage(canvas, onProgress)}\n`;
  }

  return ocrText;
}
