"use client";

import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import type { DeviceType, Device as UiDevice, Lane as UiLane } from "../devices/types";

type StoreContextValue = {
  storeId: string | null;
  lanes: UiLane[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createLane: (name: string) => Promise<boolean>;
  updateLaneName: (laneId: string, name: string) => Promise<boolean>;
  savePairingCode: (laneId: string, code: string) => Promise<boolean>;
};

const StoreContext = createContext<StoreContextValue>({
  storeId: null,
  lanes: [],
  loading: true,
  error: null,
  refresh: async () => {},
  createLane: async () => false,
  updateLaneName: async () => false,
  savePairingCode: async () => false,
});

function mapDbTypeToUiType(dbType: string): DeviceType {
  switch (dbType) {
    case "REGISTER":
      return "Register";
    case "TERMINAL":
      return "Terminal";
    case "CUSTOMER_DISPLAY":
      return "Display";
    default:
      return "Register";
  }
}

function formatLastSeen(iso: string | null): string {
  if (!iso) return "Never";
  const last = new Date(iso).getTime();
  const diffSec = Math.max(0, Math.floor((Date.now() - last) / 1000));
  if (diffSec < 30) return "Just now";
  if (diffSec < 60) return `${diffSec}s ago`;
  const min = Math.floor(diffSec / 60);
  if (min < 60) return `${min}m ago`;
  const hrs = Math.floor(min / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function isOnline(lastSeenIso: string | null): boolean {
  if (!lastSeenIso) return false;
  const last = new Date(lastSeenIso).getTime();
  const fiveMinutesMs = 5 * 60 * 1000;
  return Date.now() - last < fiveMinutesMs;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [storeId, setStoreId] = useState<string | null>(null);
  const [lanes, setLanes] = useState<UiLane[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: userRes } = await supabase.auth.getUser();
      const user = userRes?.user;
      if (!user) {
        setStoreId(null);
        setLanes([]);
        return;
      }

      const { data: stores, error: storeErr } = await supabase
        .from("business_profiles")
        .select("id")
        .limit(1);
      if (storeErr) throw storeErr;
      const id = stores?.[0]?.id ?? null;
      setStoreId(id);
      if (!id) {
        setLanes([]);
        return;
      }

      const [{ data: dbLanes, error: lanesErr }, { data: dbDevices, error: devicesErr }] = await Promise.all([
        supabase.from("lanes").select("id, name, status").eq("store_id", id).eq("status", "active"),
        supabase.from("devices").select("id, lane_id, type, label, last_seen_at, is_active").eq("store_id", id).eq("is_active", true),
      ]);
      if (lanesErr) throw lanesErr;
      if (devicesErr) throw devicesErr;

      const lanesMapped: UiLane[] = (dbLanes ?? []).map((ln) => {
        const devicesForLane = (dbDevices ?? []).filter((d) => d.lane_id === ln.id);
        const uiDevices: UiDevice[] = devicesForLane.map((d) => ({
          id: d.id,
          name: d.label,
          type: mapDbTypeToUiType(d.type),
          lastSeen: formatLastSeen(d.last_seen_at),
          status: isOnline(d.last_seen_at) ? "Online" : "Offline",
        }));
        const anyOnline = uiDevices.some((d) => d.status === "Online");
        return {
          id: ln.id,
          name: ln.name,
          status: anyOnline ? "Online" : "Offline",
          devices: uiDevices,
        };
      });

      setLanes(lanesMapped);
    } catch (e: unknown) {
      if (e && typeof e === "object" && "message" in e) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setError((e as any).message as string);
      } else {
        setError("Failed to load store data");
      }
      setLanes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const createLane = async (name: string): Promise<boolean> => {
    if (!storeId) return false;
    const { data, error: err } = await supabase
      .from("lanes")
      .insert([{ store_id: storeId, name, status: "active" }])
      .select("id, name, status")
      .single();
    if (err || !data) return false;
    setLanes((prev) => [...prev, { id: data.id, name: data.name, status: "Offline", devices: [] }]);
    return true;
  };

  const updateLaneName = async (laneId: string, name: string): Promise<boolean> => {
    const { error: err } = await supabase
      .from("lanes")
      .update({ name })
      .eq("id", laneId);
    if (err) return false;
    setLanes((prev) => prev.map((l) => (l.id === laneId ? { ...l, name } : l)));
    return true;
  };

  const savePairingCode = async (laneId: string, code: string): Promise<boolean> => {
    if (!storeId) return false;
    const { data: userRes } = await supabase.auth.getUser();
    const userId = userRes?.user?.id;
    if (!userId) return false;
    const expires = new Date(Date.now() + 60 * 1000).toISOString();
    const { error } = await supabase.from("pairing_codes").insert([
      { code, store_id: storeId, lane_id: laneId, generated_by_user_id: userId, expires_at: expires },
    ]);
    return !error;
  };

  const value = useMemo<StoreContextValue>(() => ({
    storeId,
    lanes,
    loading,
    error,
    refresh: load,
    createLane,
    updateLaneName,
    savePairingCode,
  }), [storeId, lanes, loading, error, load, createLane, updateLaneName, savePairingCode]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  return useContext(StoreContext);
}


