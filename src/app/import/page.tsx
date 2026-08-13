"use client";

import { useRef, useState } from "react";
import { CheckCircle2, Loader2, Upload } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { extractReceiptFromFile, type OcrProgress } from "@/lib/ocr/importTicket";
import { importParsedReceipt } from "@/lib/db/mutations";
import type { ParsedReceipt } from "@/lib/types/domain";

type Status = "idle" | "processing" | "review" | "saving" | "done" | "error";

export default function ImportPage() {
  const { householdId } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);

  const [status, setStatus] = useState<Status>("idle");
  const [progress, setProgress] = useState<OcrProgress | null>(null);
  const [parsed, setParsed] = useState<ParsedReceipt | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setStatus("processing");
    setError(null);
    setProgress(null);

    try {
      const result = await extractReceiptFromFile(file, setProgress);
      setParsed(result);
      setStatus("review");
    } catch (err) {
      console.error(err);
      setError("Impossible de lire ce ticket. Essayez une photo plus nette.");
      setStatus("error");
    }
  }

  async function handleSave() {
    if (!parsed || !householdId) return;
    setStatus("saving");
    try {
      await importParsedReceipt(householdId, parsed);
      setStatus("done");
    } catch (err) {
      console.error(err);
      setError("La sauvegarde a échoué. Réessayez.");
      setStatus("error");
    }
  }

  function reset() {
    setStatus("idle");
    setParsed(null);
    setProgress(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="space-y-6 pb-6">
      <div>
        <h1 className="text-2xl font-semibold text-anthracite-800">Importer un ticket</h1>
        <p className="text-sm text-muted-foreground">
          PDF, JPG, PNG ou capture d&apos;écran — NOOK s&apos;occupe du reste.
        </p>
      </div>

      {status === "idle" && (
        <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-sage-300 bg-sage-50 py-16 text-center">
          <Upload className="h-8 w-8 text-sage-600" />
          <span className="text-sm font-medium text-anthracite-800">
            Choisir un fichier
          </span>
          <span className="text-xs text-muted-foreground">
            Ticket de caisse, facture PDF ou capture
          </span>
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleFile(file);
            }}
          />
        </label>
      )}

      {status === "processing" && (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-10">
            <Loader2 className="h-8 w-8 animate-spin text-sage-600" />
            <p className="text-sm text-anthracite-800">
              {progress?.status === "recognizing text"
                ? "Lecture du ticket..."
                : "Analyse en cours..."}
            </p>
            {progress && <Progress value={progress.progress * 100} className="w-48" />}
          </CardContent>
        </Card>
      )}

      {status === "review" && parsed && (
        <div className="space-y-4">
          <Card>
            <CardContent className="flex items-center gap-3 py-5">
              <CheckCircle2 className="h-6 w-6 text-sage-600" />
              <div>
                <p className="font-medium text-anthracite-800">Ticket analysé</p>
                <p className="text-sm text-muted-foreground">
                  {parsed.items.length} produits détectés
                  {parsed.storeName ? ` — ${parsed.storeName}` : ""}
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            {parsed.items.map((item, i) => (
              <div
                key={`${item.rawLabel}-${i}`}
                className="flex items-center justify-between rounded-lg border border-border px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-anthracite-800">
                    {item.normalizedName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Qté {item.quantity}
                    {item.price ? ` · ${item.price.toFixed(2)} €` : ""}
                  </p>
                </div>
                <Badge variant="muted">{item.category}</Badge>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={reset}>
              Annuler
            </Button>
            <Button className="flex-1" onClick={handleSave}>
              Enregistrer
            </Button>
          </div>
        </div>
      )}

      {status === "saving" && (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-10">
            <Loader2 className="h-8 w-8 animate-spin text-sage-600" />
            <p className="text-sm text-anthracite-800">Enregistrement...</p>
          </CardContent>
        </Card>
      )}

      {status === "done" && parsed && (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
            <CheckCircle2 className="h-10 w-10 text-sage-600" />
            <div>
              <p className="font-medium text-anthracite-800">
                NOOK a trouvé {parsed.items.length} produits.
              </p>
              <p className="text-sm text-muted-foreground">
                Votre stock probable vient d&apos;être mis à jour.
              </p>
            </div>
            <Button onClick={reset}>Importer un autre ticket</Button>
          </CardContent>
        </Card>
      )}

      {status === "error" && (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <p className="text-sm text-destructive">{error}</p>
            <Button variant="outline" onClick={reset}>
              Réessayer
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
