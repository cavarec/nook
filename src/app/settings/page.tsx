"use client";

import Link from "next/link";
import { ChevronRight, History, Trash2, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";

const LINKS = [
  { href: "/history", label: "Historique des tickets", icon: History },
  { href: "/waste", label: "Anti-gaspillage", icon: Trash2 },
  { href: "/account", label: "Mon compte", icon: User },
];

export default function SettingsPage() {
  const { householdId } = useAuth();
  const [memberCount, setMemberCount] = useState<number | null>(null);

  useEffect(() => {
    if (!householdId) return;
    const supabase = createClient();
    supabase
      .from("household_members")
      .select("user_id", { count: "exact", head: true })
      .eq("household_id", householdId)
      .then(({ count }) => setMemberCount(count ?? null));
  }, [householdId]);

  return (
    <div className="space-y-6 pb-6">
      <div>
        <h1 className="text-2xl font-semibold text-anthracite-800">Réglages</h1>
        <p className="text-sm text-muted-foreground">Votre foyer NOOK.</p>
      </div>

      <Card>
        <CardContent className="py-4">
          <p className="text-xs text-muted-foreground">Foyer</p>
          <p className="text-base font-medium text-anthracite-800">
            {memberCount !== null
              ? `${memberCount} membre${memberCount > 1 ? "s" : ""}`
              : "Chargement..."}
          </p>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {LINKS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center justify-between rounded-xl border border-border px-4 py-3.5"
          >
            <span className="flex items-center gap-3 text-anthracite-800">
              <Icon className="h-4.5 w-4.5 text-muted-foreground" />
              {label}
            </span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
        ))}
      </div>

      <p className="pt-4 text-center text-xs text-muted-foreground">
        NOOK — Votre maison a de la mémoire.
      </p>
    </div>
  );
}
