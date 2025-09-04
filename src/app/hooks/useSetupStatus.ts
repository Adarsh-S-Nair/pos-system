"use client";

import { useEffect, useState } from "react";
import { getLocalJSON } from "../lib/storage";

type StoreProfile = {
  name?: string;
  timezone?: string;
  [key: string]: unknown;
};

// Returns whether the local store profile exists and has required fields.
export function useSetupStatus() {
  const [hasStore, setHasStore] = useState<boolean>(false);
  const [checked, setChecked] = useState<boolean>(false);

  useEffect(() => {
    const prof = getLocalJSON<StoreProfile>("pos.storeProfile.v1");
    const ok = !!prof && typeof prof === "object" && !!prof.name && !!prof.timezone;
    setHasStore(ok);
    setChecked(true);
  }, []);

  return { hasStore, checked };
}


