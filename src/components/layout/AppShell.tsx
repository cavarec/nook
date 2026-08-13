"use client";

import { usePathname } from "next/navigation";
import { Header } from "./Header";
import { BottomNav } from "./BottomNav";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isOnboarding = pathname === "/";

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
