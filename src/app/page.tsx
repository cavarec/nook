"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { NookLogo } from "@/components/layout/NookLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const FEATURES = [
  {
    icon: "/brand/feature-courses.png",
    title: "Liste de courses",
    body: "Ajoutez, partagez, achetez l'esprit tranquille.",
  },
  {
    icon: "/brand/feature-stock.png",
    title: "Stock maison",
    body: "Suivez vos produits dans vos placards et frigo.",
  },
  {
    icon: "/brand/feature-peremption.png",
    title: "Dates de péremption",
    body: "Évitez le gaspillage.",
  },
  {
    icon: "/brand/feature-famille.png",
    title: "En famille",
    body: "Partagez avec vos proches.",
  },
] as const;

const STEP_COUNT = 3;

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [showAuth, setShowAuth] = useState(false);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-between bg-gradient-to-b from-leaf-50 to-mist-100 px-6 py-12 text-center">
      {!showAuth ? (
        <>
          <div className="flex flex-1 flex-col items-center justify-center gap-6">
            {step === 0 && (
              <>
                <NookLogo className="h-16 w-16" />
                <div className="space-y-3">
                  <h1 className="text-2xl font-semibold tracking-tight text-mist-900">
                    NOOK
                  </h1>
                  <p className="text-base text-mist-500">
                    Votre maison a de la mémoire.
                  </p>
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <Image
                  src="/brand/mascotte-principale.png"
                  alt=""
                  width={585}
                  height={505}
                  className="w-56 max-w-full rounded-3xl"
                  priority
                />
                <div className="space-y-3">
                  <h1 className="text-2xl font-semibold tracking-tight text-mist-900">
                    Importez vos tickets de caisse.
                  </h1>
                  <p className="text-base text-mist-500">
                    NOOK reconstruit automatiquement votre stock maison.
                  </p>
                </div>
              </>
            )}

            {step === 2 && (
              <div className="w-full max-w-xs space-y-5">
                <h1 className="text-xl font-semibold tracking-tight text-mist-900">
                  Avant d&apos;acheter,
                  <br />
                  vérifiez ce que vous possédez déjà.
                </h1>
                <div className="space-y-3 text-left">
                  {FEATURES.map((feature) => (
                    <div
                      key={feature.title}
                      className="flex items-center gap-3 rounded-xl bg-white/70 p-3 shadow-sm"
                    >
                      <Image
                        src={feature.icon}
                        alt=""
                        width={75}
                        height={75}
                        className="h-10 w-10 shrink-0"
                      />
                      <div>
                        <p className="text-sm font-semibold text-mist-900">
                          {feature.title}
                        </p>
                        <p className="text-xs text-mist-500">{feature.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex w-full max-w-xs flex-col items-center gap-6">
            <div className="flex gap-2">
              {Array.from({ length: STEP_COUNT }).map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "h-1.5 w-6 rounded-full bg-leaf-200",
                    i === step && "bg-leaf-600"
                  )}
                />
              ))}
            </div>

            {step < STEP_COUNT - 1 ? (
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
        <h2 className="text-xl font-semibold text-mist-900">
          {mode === "signup" ? "Créer votre foyer" : "Se connecter"}
        </h2>
        <p className="text-sm text-mist-500">
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
        className="text-sm text-mist-500 underline underline-offset-4"
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
