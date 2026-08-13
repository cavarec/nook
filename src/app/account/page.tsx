"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function AccountPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <div className="space-y-6 pb-6">
      <div>
        <h1 className="text-2xl font-semibold text-mist-900">Mon compte</h1>
      </div>

      <Card>
        <CardContent className="py-4">
          <p className="text-xs text-muted-foreground">Adresse email</p>
          <p className="text-base font-medium text-mist-900">
            {loading ? "Chargement..." : user?.email ?? "Non connecté"}
          </p>
        </CardContent>
      </Card>

      <Button variant="outline" className="w-full" onClick={handleSignOut}>
        Se déconnecter
      </Button>
    </div>
  );
}
