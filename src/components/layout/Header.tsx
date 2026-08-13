import Link from "next/link";
import { Settings } from "lucide-react";
import { NookLogo } from "@/components/layout/NookLogo";

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-lg items-center justify-between px-5 py-3">
        <Link href="/dashboard" className="flex items-center gap-2">
          <NookLogo className="h-7 w-7" />
          <span className="text-lg font-semibold tracking-tight">NOOK</span>
        </Link>
        <Link
          href="/settings"
          className="rounded-full p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
          aria-label="Réglages"
        >
          <Settings className="h-5 w-5" />
        </Link>
      </div>
    </header>
  );
}
