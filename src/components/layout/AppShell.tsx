"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { Header } from "./Header";
import { BottomNav } from "./BottomNav";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isOnboarding = pathname === "/";
  const { householdId } = useAuth();
  // Synchronise Supabase -> cache local des l'ouverture de l'app, quelle
  // que soit la page d'entree (avant, seul /dashboard le declenchait : les
  // autres pages restaient vides sur un cache local froid).
  useOfflineSync(isOnboarding ? null : householdId);

  if (isOnboarding) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <main className="mx-auto w-full max-w-lg flex-1 px-5 pb-24 pt-4">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
