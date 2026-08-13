"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Package, PlusCircle, Search, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/dashboard", label: "Accueil", icon: Home, emphasized: false },
  { href: "/inventory", label: "Inventaire", icon: Package, emphasized: false },
  { href: "/import", label: "Importer", icon: PlusCircle, emphasized: true },
  { href: "/shopping", label: "Courses", icon: ShoppingCart, emphasized: false },
  { href: "/search", label: "Recherche", icon: Search, emphasized: false },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-lg items-stretch justify-between px-2">
        {TABS.map(({ href, label, icon: Icon, emphasized }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-xs font-medium text-muted-foreground transition-colors",
                active && "text-primary"
              )}
            >
              <Icon
                className={cn(
                  emphasized ? "h-8 w-8" : "h-5 w-5",
                  active && "text-primary"
                )}
                strokeWidth={emphasized ? 1.75 : 2}
              />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
