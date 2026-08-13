"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getDb } from "@/lib/db/indexeddb";
import { Card, CardContent } from "@/components/ui/card";

export default function HistoryPage() {
  const { householdId } = useAuth();

  const data = useLiveQuery(async () => {
    if (!householdId) return null;
    const db = getDb();
    const [tickets, purchases] = await Promise.all([
      db.tickets.where("householdId").equals(householdId).toArray(),
      db.purchases.where("householdId").equals(householdId).toArray(),
    ]);
    return { tickets, purchases };
  }, [householdId]);

  const tickets = useMemo(() => {
    if (!data) return [];
    return [...data.tickets]
      .sort(
        (a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime()
      )
      .map((ticket) => ({
        ticket,
        itemCount: data.purchases.filter((p) => p.sourceTicketId === ticket.id).length,
      }));
  }, [data]);

  return (
    <div className="space-y-4 pb-6">
      <div>
        <h1 className="text-2xl font-semibold text-mist-900">Historique</h1>
        <p className="text-sm text-muted-foreground">Tous les tickets importés.</p>
      </div>

      {tickets.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Aucun ticket importé pour le moment.
        </p>
      ) : (
        <div className="space-y-2">
          {tickets.map(({ ticket, itemCount }) => (
            <Card key={ticket.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div>
                  <p className="font-medium text-mist-900">
                    {ticket.storeName ?? "Ticket sans enseigne"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(ticket.purchaseDate).toLocaleDateString("fr-FR")} ·{" "}
                    {itemCount} produit{itemCount > 1 ? "s" : ""}
                  </p>
                </div>
                {ticket.totalAmount !== null && (
                  <span className="text-sm font-medium text-mist-900">
                    {ticket.totalAmount.toFixed(2)} €
                  </span>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
