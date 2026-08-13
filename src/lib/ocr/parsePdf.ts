"use client";

import type { OcrProgress } from "./extractText";

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
    const pageText = textContent.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ");
    embeddedText += `${pageText}\n`;
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
