"use client";

import Link from "next/link";
import { ChevronRight, Copy, History, Trash2, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import { joinHouseholdByCode, resetHouseholdData } from "@/lib/db/household";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/layout/PageHeader";

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
      <PageHeader
        icon="famille"
        title="Réglages"
        subtitle="Votre foyer NOOK."
      />

      <Card>
        <CardContent className="space-y-4 py-4">
          <div>
            <p className="text-xs text-muted-foreground">Foyer</p>
            <p className="text-base font-medium text-mist-900">
              {memberCount !== null
                ? `${memberCount} membre${memberCount > 1 ? "s" : ""}`
                : "Chargement..."}
            </p>
          </div>
          {householdId && <HouseholdCode code={householdId} />}
        </CardContent>
      </Card>

      <JoinHouseholdForm currentHouseholdId={householdId} />

      <div className="space-y-2">
        {LINKS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center justify-between rounded-xl border border-border px-4 py-3.5"
          >
            <span className="flex items-center gap-3 text-mist-900">
              <Icon className="h-4.5 w-4.5 text-muted-foreground" />
              {label}
            </span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
        ))}
      </div>

      {householdId && <ResetDataSection householdId={householdId} />}

      <p className="pt-4 text-center text-xs text-muted-foreground">
        NOOK — Votre maison a de la mémoire.
      </p>
    </div>
  );
}

function HouseholdCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div>
      <p className="text-xs text-muted-foreground">
        Code d&apos;invitation — partagez-le pour que quelqu&apos;un rejoigne votre foyer
      </p>
      <div className="mt-1 flex items-center gap-2">
        <code className="flex-1 truncate rounded-lg bg-muted px-3 py-2 text-xs text-mist-900">
          {code}
        </code>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-9 w-9 shrink-0"
          onClick={handleCopy}
          aria-label="Copier le code du foyer"
        >
          <Copy className="h-4 w-4" />
        </Button>
      </div>
      {copied && <p className="mt-1 text-xs text-leaf-600">Copié !</p>}
    </div>
  );
}

function JoinHouseholdForm({
  currentHouseholdId,
}: {
  currentHouseholdId: string | null;
}) {
  const [code, setCode] = useState("");
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) return;
    if (trimmed === currentHouseholdId) {
      setError("Vous êtes déjà dans ce foyer.");
      return;
    }
    setJoining(true);
    setError(null);
    try {
      await joinHouseholdByCode(trimmed);
      window.location.href = "/dashboard";
    } catch (err) {
      console.error(err);
      setError("Code invalide. Vérifiez qu'il est correctement copié.");
      setJoining(false);
    }
  }

  return (
    <Card>
      <CardContent className="py-4">
        <p className="text-sm font-medium text-mist-900">Rejoindre un autre foyer</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Collez le code d&apos;invitation reçu d&apos;un proche. Vous quitterez
          votre foyer actuel s&apos;il est vide.
        </p>
        <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Code du foyer"
            className="h-10 text-sm"
          />
          <Button type="submit" size="sm" className="h-10 shrink-0" disabled={joining}>
            {joining ? "..." : "Rejoindre"}
          </Button>
        </form>
        {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
      </CardContent>
    </Card>
  );
}

function ResetDataSection({ householdId }: { householdId: string }) {
  const [confirming, setConfirming] = useState(false);
  const [resetting, setResetting] = useState(false);

  async function handleConfirm() {
    setResetting(true);
    try {
      await resetHouseholdData(householdId);
      window.location.href = "/dashboard";
    } catch (err) {
      console.error(err);
      setResetting(false);
    }
  }

  return (
    <Card>
      <CardContent className="space-y-2 py-4">
        <p className="text-sm font-medium text-mist-900">Réinitialiser les données</p>
        <p className="text-xs text-muted-foreground">
          Supprime définitivement tous les produits, achats et tickets du
          foyer. Le compte et le foyer restent, mais la mémoire de NOOK
          repart de zéro.
        </p>
        {!confirming ? (
          <Button
            type="button"
            variant="outline"
            className="mt-2 w-full text-destructive"
            onClick={() => setConfirming(true)}
          >
            Réinitialiser les données du foyer
          </Button>
        ) : (
          <div className="mt-2 space-y-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
            <p className="text-xs font-medium text-destructive">
              Action irréversible. Confirmer la suppression de toutes les
              données du foyer ?
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setConfirming(false)}
                disabled={resetting}
              >
                Annuler
              </Button>
              <Button
                type="button"
                variant="destructive"
                className="flex-1"
                onClick={handleConfirm}
                disabled={resetting}
              >
                {resetting ? "Suppression..." : "Confirmer"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
