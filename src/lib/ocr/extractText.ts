"use client";

export interface OcrProgress {
  status: string;
  progress: number;
}

/** OCR d'une image (JPG/PNG/capture) ou d'un canvas via Tesseract.js (WASM, cote client). */
export async function extractTextFromImage(
  source: File | Blob | HTMLCanvasElement,
  onProgress?: (progress: OcrProgress) => void
): Promise<string> {
  const { createWorker } = await import("tesseract.js");

  const worker = await createWorker("fra", 1, {
    logger: (m) => {
      if (onProgress && typeof m.progress === "number") {
        onProgress({ status: m.status, progress: m.progress });
      }
    },
  });

  try {
    const { data } = await worker.recognize(source);
    return data.text;
  } finally {
    await worker.terminate();
  }
}
