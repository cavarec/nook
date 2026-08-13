"use client";

import { useState } from "react";
import Link from "next/link";
import { Search as SearchIcon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useSearch } from "@/hooks/useSearch";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function SearchPage() {
  const { householdId } = useAuth();
  const [query, setQuery] = useState("");
  const results = useSearch(query, householdId);

  return (
    <div className="flex flex-col gap-6">
      <div className="relative">
        <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          autoFocus
          placeholder="Rechercher un produit..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-14 pl-11 text-base"
        />
      </div>

      {query && results.length === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Aucun produit trouvé pour « {query} ».
        </p>
      )}

      <div className="space-y-3">
        {results.map((insight) => (
          <Link
            key={insight.product.id}
            href={`/inventory?product=${insight.product.id}`}
            className="block rounded-xl border border-border p-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-anthracite-800">
                  {insight.product.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  Stock probable : {insight.estimatedQuantity}
                </p>
              </div>
              <Badge variant="muted">
                Confiance {Math.round(insight.confidenceScore * 100)}%
              </Badge>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Dernier achat :{" "}
              {insight.lastPurchaseDate
                ? `il y a ${insight.daysSinceLastPurchase} jours`
                : "inconnu"}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
