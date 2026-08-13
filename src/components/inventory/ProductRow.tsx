"use client";

import { Minus, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ProductInsight } from "@/lib/insights";
import { addStockCorrection } from "@/lib/db/mutations";

const FRESHNESS_LABEL: Record<string, string> = {
  fresh: "Récent",
  watch: "À surveiller",
  urgent: "À consommer rapidement",
};

export function ProductRow({
  insight,
  householdId,
  userId,
}: {
  insight: ProductInsight;
  householdId: string;
  userId: string | null;
}) {
  const { product, estimatedQuantity, confidenceScore, freshnessStatus } = insight;

  return (
    <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-anthracite-800">{product.name}</p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Stock probable : {estimatedQuantity}
          </span>
          <Badge variant="muted">{Math.round(confidenceScore * 100)}%</Badge>
          {freshnessStatus && freshnessStatus !== "unknown" && (
            <Badge variant={freshnessStatus as "fresh" | "watch" | "urgent"}>
              {FRESHNESS_LABEL[freshnessStatus]}
            </Badge>
          )}
        </div>
      </div>

      <div className="ml-3 flex items-center gap-1">
        <Button
          size="icon"
          variant="outline"
          className="h-8 w-8"
          onClick={() =>
            void addStockCorrection(householdId, product.id, "decrement", userId)
          }
          aria-label="Retirer une unité"
        >
          <Minus className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="outline"
          className="h-8 w-8"
          onClick={() =>
            void addStockCorrection(householdId, product.id, "increment", userId)
          }
          aria-label="Ajouter une unité"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
