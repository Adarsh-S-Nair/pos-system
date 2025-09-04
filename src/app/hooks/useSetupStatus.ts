"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

// Returns whether a store profile exists in DB for the current user.
export function useSetupStatus() {
  const [hasStore, setHasStore] = useState<boolean>(false);
  const [checked, setChecked] = useState<boolean>(false);

  useEffect(() => {
    const run = async () => {
      try {
        const { data: userRes } = await supabase.auth.getUser();
        const user = userRes?.user;
        if (!user) {
          setHasStore(false);
          setChecked(true);
          return;
        }
        // RLS restricts to owner only; selecting any row indicates presence
        const { data, error } = await supabase
          .from("business_profiles")
          .select("id")
          .limit(1);
        if (error) {
          setHasStore(false);
        } else {
          setHasStore((data?.length ?? 0) > 0);
        }
      } finally {
        setChecked(true);
      }
    };
    void run();
  }, []);

  return { hasStore, checked };
}


