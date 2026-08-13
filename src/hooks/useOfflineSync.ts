"use client";

import { useEffect, useState } from "react";
import { syncWithSupabase } from "@/lib/db/sync";

export interface OfflineSyncState {
  online: boolean;
  syncing: boolean;
  lastSyncedAt: Date | null;
}

/** Synchronise la file locale vers Supabase des que le reseau revient. */
export function useOfflineSync(householdId: string | null): OfflineSyncState {
  const [online, setOnline] = useState(
    typeof navigator === "undefined" ? true : navigator.onLine
  );
  const [syncing, setSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);

  useEffect(() => {
    if (!householdId) return;

    async function runSync() {
      if (!householdId) return;
      setSyncing(true);
      try {
        await syncWithSupabase(householdId);
        setLastSyncedAt(new Date());
      } finally {
        setSyncing(false);
      }
    }

    function handleOnline() {
      setOnline(true);
      void runSync();
    }
    function handleOffline() {
      setOnline(false);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    if (navigator.onLine) {
      void runSync();
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [householdId]);

  return { online, syncing, lastSyncedAt };
}
