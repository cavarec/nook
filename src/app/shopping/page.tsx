"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getDb } from "@/lib/db/indexeddb";
import { computeProductInsight } from "@/lib/insights";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/PageHeader";

const LOW_STOCK_THRESHOLD = 0.5;

export default function ShoppingPage() {
  const { householdId } = useAuth();

  const data = useLiveQuery(async () => {
    if (!householdId) return null;
    const db = getDb();
    const [products, purchases, corrections] = await Promise.all([
      db.products.where("householdId").equals(householdId).toArray(),
      db.purchases.where("householdId").equals(householdId).toArray(),
      db.stockCorrections.where("householdId").equals(householdId).toArray(),
    ]);
    return { products, purchases, corrections };
  }, [householdId]);

  const { toBuy, available } = useMemo(() => {
    if (!data) return { toBuy: [], available: [] };
    const insights = data.products.map((product) =>
      computeProductInsight(product, data.purchases, data.corrections)
    );
    return {
      toBuy: insights
        .filter(
          (i) =>
            i.estimatedQuantity <= LOW_STOCK_THRESHOLD ||
            i.freshnessStatus === "urgent"
        )
        .sort((a, b) => a.estimatedQuantity - b.estimatedQuantity),
      available: insights.filter(
        (i) =>
          i.estimatedQuantity > LOW_STOCK_THRESHOLD &&
          i.freshnessStatus !== "urgent"
      ),
    };
  }, [data]);

  return (
    <div className="space-y-6 pb-6">
      <PageHeader
        icon="/brand/feature-courses.png"
        title="Mode courses"
        subtitle="Vérifiez avant d'acheter — évitez les doublons."
      />

      <section className="space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          À racheter
        </h2>
        {toBuy.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Vous avez probablement tout ce qu&apos;il faut.
          </p>
        ) : (
          toBuy.map((i) => (
            <Card key={i.product.id}>
              <CardContent className="flex items-center justify-between py-3">
                <span className="font-medium text-mist-900">{i.product.name}</span>
                <Badge variant="urgent">Probablement épuisé</Badge>
              </CardContent>
            </Card>
          ))
        )}
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Déjà disponibles
        </h2>
        {available.length === 0 ? (
          <p className="text-sm text-muted-foreground">Rien à afficher ici pour le moment.</p>
        ) : (
          available.map((i) => (
            <Card key={i.product.id}>
              <CardContent className="flex items-center justify-between py-3">
                <span className="text-mist-900">{i.product.name}</span>
                <span className="text-sm text-muted-foreground">
                  Stock probable : {i.estimatedQuantity}
                </span>
              </CardContent>
            </Card>
          ))
        )}
      </section>
    </div>
  );
}
