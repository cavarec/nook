"use client";

import type { ParsedReceipt } from "@/lib/types/domain";
import { extractTextFromImage, type OcrProgress } from "./extractText";
import { extractTextFromPdf } from "./parsePdf";
import { parseReceiptText } from "./parseReceipt";

export type { OcrProgress };

/** Point d'entree unique de l'import : fichier -> texte OCR -> ticket structure. */
export async function extractReceiptFromFile(
  file: File,
  onProgress?: (progress: OcrProgress) => void
): Promise<ParsedReceipt> {
  const rawText =
    file.type === "application/pdf"
      ? await extractTextFromPdf(file, onProgress)
      : await extractTextFromImage(file, onProgress);

  return parseReceiptText(rawText);
}
