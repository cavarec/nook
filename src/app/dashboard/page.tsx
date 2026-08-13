"use client";

import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { getDb } from "@/lib/db/indexeddb";
import { computeDashboardStats } from "@/lib/dashboardStats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WifiOff } from "lucide-react";

export default function DashboardPage() {
  const { householdId, loading } = useAuth();
  const { online } = useOfflineSync(householdId);

  const data = useLiveQuery(async () => {
    if (!householdId) return null;
    const db = getDb();
    const [products, purchases] = await Promise.all([
      db.products.where("householdId").equals(householdId).toArray(),
      db.purchases.where("householdId").equals(householdId).toArray(),
    ]);
    return { products, purchases };
  }, [householdId]);

  const stats = useMemo(() => {
    if (!data) return null;
    return computeDashboardStats(data.products, data.purchases);
  }, [data]);

  if (loading) {
    return <p className="py-12 text-center text-muted-foreground">Chargement...</p>;
  }

  return (
    <div className="space-y-6 pb-6">
      <div>
        <h1 className="text-2xl font-semibold text-anthracite-800">Tableau de bord</h1>
        <p className="text-sm text-muted-foreground">
          Ce que NOOK sait de votre foyer aujourd&apos;hui.
        </p>
        {!online && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-700">
            <WifiOff className="h-3.5 w-3.5" />
            Hors ligne — vos donnees se synchroniseront au retour du reseau.
          </div>
        )}
      </div>

      {!stats || stats.trackedProductCount === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Valeur du stock estime" value={`${stats.estimatedStockValue.toFixed(2)} €`} />
            <StatCard label="Produits suivis" value={String(stats.trackedProductCount)} />
            <StatCard label="Economies estimees" value={`${stats.estimatedSavings.toFixed(2)} €`} />
            <StatCard
              label="Achats en double"
              value={String(stats.frequentDuplicates.length)}
            />
          </div>

          <ProductList title="Top achats" items={stats.topPurchased.map((s) => ({
            name: s.product.name,
            detail: `${s.totalQuantity} unites achetees`,
          }))} />

          <ProductList title="Produits les plus consommes" items={stats.mostConsumed.map((s) => ({
            name: s.product.name,
            detail: `${s.purchaseCount} achats`,
          }))} />

          {stats.frequentDuplicates.length > 0 && (
            <ProductList
              title="Souvent rachetes en double"
              items={stats.frequentDuplicates.map((s) => ({
                name: s.product.name,
                detail: "Racheté alors qu'il en restait probablement",
              }))}
            />
          )}
        </>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="pt-5">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-1 text-xl font-semibold text-anthracite-800">{value}</p>
      </CardContent>
    </Card>
  );
}

function ProductList({
  title,
  items,
}: {
  title: string;
  items: { name: string; detail: string }[];
}) {
  if (items.length === 0) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.map((item) => (
          <div key={item.name} className="flex items-center justify-between text-sm">
            <span className="text-anthracite-800">{item.name}</span>
            <span className="text-muted-foreground">{item.detail}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function EmptyState() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
        <p className="text-anthracite-800">NOOK n&apos;a encore aucun souvenir de votre foyer.</p>
        <p className="text-sm text-muted-foreground">
          Importez votre premier ticket pour commencer.
        </p>
        <Link
          href="/import"
          className="mt-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
        >
          Importer un ticket
        </Link>
      </CardContent>
    </Card>
  );
}
