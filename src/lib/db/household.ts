"use client";

import { createClient } from "@/lib/supabase/client";
import { getDb } from "./indexeddb";

/**
 * Rejoint un foyer existant via son code d'invitation (l'UUID du foyer).
 * Passe par la fonction Postgres `join_household` (SECURITY DEFINER) : la
 * RLS n'autorise pas l'ecriture directe dans household_members cote
 * client. Quitte au passage l'ancien foyer solo s'il est vide.
 */
export async function joinHouseholdByCode(inviteCode: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.rpc("join_household", {
    invite_code: inviteCode,
  });
  if (error) throw error;
}

/**
 * Supprime definitivement toutes les donnees du foyer (produits, achats,
 * tickets, stock estime, corrections) en base et dans le cache local. Le
 * compte et le foyer lui-meme restent intacts.
 */
export async function resetHouseholdData(householdId: string): Promise<void> {
  const supabase = createClient();

  // Supprimer les produits entraine en cascade purchases/estimated_stock/
  // stock_corrections (contraintes FK). Les tickets ne dependent pas des
  // produits (source_ticket_id est en SET NULL) : suppression separee.
  const { error: productsError } = await supabase
    .from("products")
    .delete()
    .eq("household_id", householdId);
  if (productsError) throw productsError;

  const { error: ticketsError } = await supabase
    .from("tickets")
    .delete()
    .eq("household_id", householdId);
  if (ticketsError) throw ticketsError;

  const db = getDb();
  await Promise.all([
    db.products.where("householdId").equals(householdId).delete(),
    db.purchases.where("householdId").equals(householdId).delete(),
    db.tickets.where("householdId").equals(householdId).delete(),
    db.estimatedStock.where("householdId").equals(householdId).delete(),
    db.stockCorrections.where("householdId").equals(householdId).delete(),
    db.pendingMutations.clear(),
  ]);
}
