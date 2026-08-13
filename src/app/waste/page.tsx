"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getDb } from "@/lib/db/indexeddb";
import { computeFreshness, calculatePotentialWasteValue } from "@/lib/waste/freshnessEngine";
import { PERISHABLE_CATEGORIES } from "@/lib/types/domain";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/PageHeader";

const FRESHNESS_LABEL: Record<string, { emoji: string; label: string }> = {
  fresh: { emoji: "🟢", label: "Récent" },
  watch: { emoji: "🟠", label: "À surveiller" },
  urgent: { emoji: "🔴", label: "À consommer rapidement" },
};

export default function WastePage() {
  const { householdId } = useAuth();

  const data = useLiveQuery(async () => {
    if (!householdId) return null;
    const db = getDb();
    const products = await db.products
      .where("householdId")
      .equals(householdId)
      .filter((p) => PERISHABLE_CATEGORIES.includes(p.category))
      .toArray();
    const purchases = await db.purchases
      .where("householdId")
      .equals(householdId)
      .toArray();
    return { products, purchases };
  }, [householdId]);

  const items = useMemo(() => {
    if (!data) return [];
    return data.products
      .map((product) => {
        const productPurchases = data.purchases
          .filter((p) => p.productId === product.id)
          .sort(
            (a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime()
          );
        const lastPurchase = productPurchases[0];
        if (!lastPurchase) return null;
        const freshness = computeFreshness(
          lastPurchase.purchaseDate,
          product.averageShelfLifeDays
        );
        return { product, freshness, price: lastPurchase.price };
      })
      .filter(
        (item): item is NonNullable<typeof item> =>
          item !== null && item.freshness.status !== "unknown"
      )
      .sort((a, b) => (a.freshness.daysRemaining ?? 0) - (b.freshness.daysRemaining ?? 0));
  }, [data]);

  const wasteValue = useMemo(
    () =>
      calculatePotentialWasteValue(
        items.map((i) => ({ status: i.freshness.status, price: i.price }))
      ),
    [items]
  );

  return (
    <div className="space-y-6 pb-6">
      <PageHeader
        icon="peremption"
        title="Anti-gaspillage"
        subtitle="Basé sur la date d'achat, jamais sur une DLC saisie à la main."
      />

      <Card>
        <CardContent className="py-4">
          <p className="text-xs text-muted-foreground">Valeur potentiellement gaspillée</p>
          <p className="text-xl font-semibold text-mist-900">
            {wasteValue.toFixed(2)} €
          </p>
        </CardContent>
      </Card>

      {items.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Aucun produit frais suivi pour le moment.
        </p>
      ) : (
        <div className="space-y-2">
          {items.map(({ product, freshness }) => (
            <div
              key={product.id}
              className="flex items-center justify-between rounded-xl border border-border px-4 py-3"
            >
              <div>
                <p className="font-medium text-mist-900">{product.name}</p>
                <p className="text-xs text-muted-foreground">
                  Acheté il y a {freshness.daysSincePurchase} jours
                </p>
              </div>
              <Badge variant={freshness.status as "fresh" | "watch" | "urgent"}>
                {FRESHNESS_LABEL[freshness.status]?.emoji}{" "}
                {FRESHNESS_LABEL[freshness.status]?.label}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
