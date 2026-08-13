"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getDb } from "@/lib/db/indexeddb";
import { computeProductInsight } from "@/lib/insights";
import { ALL_CATEGORIES } from "@/lib/types/domain";
import { ProductRow } from "@/components/inventory/ProductRow";
import { PageHeader } from "@/components/layout/PageHeader";

export default function InventoryPage() {
  const { householdId, user } = useAuth();

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

  const grouped = useMemo(() => {
    if (!data) return [];
    const insights = data.products.map((product) =>
      computeProductInsight(product, data.purchases, data.corrections)
    );
    return ALL_CATEGORIES.map((category) => ({
      category,
      items: insights
        .filter((i) => i.product.category === category)
        .sort((a, b) => a.product.name.localeCompare(b.product.name)),
    })).filter((group) => group.items.length > 0);
  }, [data]);

  return (
    <div className="space-y-6 pb-6">
      <PageHeader
        icon="/brand/feature-stock.png"
        title="Inventaire"
        subtitle="Ce que NOOK pense que vous avez, par rayon."
      />

      {grouped.length === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Aucun produit pour le moment — importez un ticket pour commencer.
        </p>
      )}

      {grouped.map((group) => (
        <section key={group.category} className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {group.category}
          </h2>
          <div className="space-y-2">
            {group.items.map((insight) => (
              <ProductRow
                key={insight.product.id}
                insight={insight}
                householdId={householdId!}
                userId={user?.id ?? null}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
