"use client";

import { useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { getDb } from "@/lib/db/indexeddb";
import { computeProductInsight, type ProductInsight } from "@/lib/insights";
import { stripAccents } from "@/lib/normalization/rules";

/** Recherche plein texte locale (IndexedDB) sur le nom des produits du foyer. */
export function useSearch(query: string, householdId: string | null) {
  const results = useLiveQuery(async () => {
    if (!householdId) return [] as ProductInsight[];
    const db = getDb();
    const [products, purchases, corrections] = await Promise.all([
      db.products.where("householdId").equals(householdId).toArray(),
      db.purchases.where("householdId").equals(householdId).toArray(),
      db.stockCorrections.where("householdId").equals(householdId).toArray(),
    ]);

    const normalizedQuery = stripAccents(query.trim().toLowerCase());
    const matched = normalizedQuery
      ? products.filter((p) =>
          stripAccents(p.name.toLowerCase()).includes(normalizedQuery)
        )
      : products;

    return matched.map((product) =>
      computeProductInsight(product, purchases, corrections)
    );
  }, [query, householdId]);

  return useMemo(() => results ?? [], [results]);
}
