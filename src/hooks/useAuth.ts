"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

export interface AuthState {
  user: User | null;
  householdId: string | null;
  loading: boolean;
}

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    user: null,
    householdId: null,
    loading: true,
  });

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;

    async function loadHousehold(userId: string) {
      const { data } = await supabase
        .from("household_members")
        .select("household_id")
        .eq("user_id", userId)
        .limit(1)
        .maybeSingle();
      return data?.household_id ?? null;
    }

    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!mounted) return;
      const householdId = user ? await loadHousehold(user.id) : null;
      setState({ user, householdId, loading: false });
    });

    const { data: subscription } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!mounted) return;
        const user = session?.user ?? null;
        const householdId = user ? await loadHousehold(user.id) : null;
        setState({ user, householdId, loading: false });
      }
    );

    return () => {
      mounted = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  return state;
}
