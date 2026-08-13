"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { NookLogo } from "@/components/layout/NookLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const SCREENS = [
  {
    title: "NOOK",
    body: "Votre maison a de la mémoire.",
  },
  {
    title: "Importez vos tickets de caisse.",
    body: "NOOK reconstruit automatiquement votre stock maison.",
  },
  {
    title: "Avant d'acheter,\nvérifiez ce que vous possédez déjà.",
    body: null,
  },
] as const;

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [showAuth, setShowAuth] = useState(false);

  const screen = SCREENS[step];

  return (
    <div className="flex min-h-dvh flex-col items-center justify-between bg-gradient-to-b from-sage-50 to-cream-100 px-6 py-12 text-center">
      {!showAuth ? (
        <>
          <div className="flex flex-1 flex-col items-center justify-center gap-6">
            <NookLogo className="h-16 w-16" />
            <div className="space-y-3">
              <h1 className="whitespace-pre-line text-2xl font-semibold tracking-tight text-anthracite-800">
                {screen?.title}
              </h1>
              {screen?.body && (
                <p className="text-base text-anthracite-500">{screen.body}</p>
              )}
            </div>
          </div>

          <div className="flex w-full max-w-xs flex-col items-center gap-6">
            <div className="flex gap-2">
              {SCREENS.map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "h-1.5 w-6 rounded-full bg-sage-200",
                    i === step && "bg-sage-600"
                  )}
                />
              ))}
            </div>

            {step < SCREENS.length - 1 ? (
              <Button className="w-full" onClick={() => setStep((s) => s + 1)}>
                Suivant
              </Button>
            ) : (
              <Button className="w-full" onClick={() => setShowAuth(true)}>
                Commencer
              </Button>
            )}
          </div>
        </>
      ) : (
        <AuthForm onBack={() => setShowAuth(false)} />
      )}
    </div>
  );
}

function AuthForm({ onBack }: { onBack: () => void }) {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: authError } =
      mode === "signup"
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6">
      <NookLogo className="h-12 w-12" />
      <div className="w-full max-w-xs space-y-1">
        <h2 className="text-xl font-semibold text-anthracite-800">
          {mode === "signup" ? "Créer votre foyer" : "Se connecter"}
        </h2>
        <p className="text-sm text-anthracite-500">
          Importez vos tickets. NOOK se souvient du reste.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-3 text-left">
        <Input
          type="email"
          placeholder="Adresse email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          required
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Un instant..." : mode === "signup" ? "Créer mon compte" : "Se connecter"}
        </Button>
      </form>

      <button
        type="button"
        className="text-sm text-anthracite-500 underline underline-offset-4"
        onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
      >
        {mode === "signup"
          ? "Déjà un compte ? Se connecter"
          : "Pas encore de compte ? En créer un"}
      </button>

      <button
        type="button"
        className="text-xs text-muted-foreground"
        onClick={onBack}
      >
        Retour
      </button>
    </div>
  );
}
