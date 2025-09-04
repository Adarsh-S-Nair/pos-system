"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "../lib/supabaseClient";
import { DatabaseLane, DatabaseDevice, Lane, Device, DeviceType } from "../devices/types";

// Helper functions to convert database types to UI types
function convertDatabaseDeviceToUI(dbDevice: DatabaseDevice): Device {
  const getDeviceStatus = (device: DatabaseDevice): "Online" | "Offline" => {
    if (!device.is_active || device.revoked_at) return "Offline";
    if (!device.last_seen_at) return "Offline";
    
    const lastSeen = new Date(device.last_seen_at);
    const now = new Date();
    const diffMinutes = (now.getTime() - lastSeen.getTime()) / (1000 * 60);
    
    return diffMinutes <= 5 ? "Online" : "Offline";
  };

  const getLastSeenText = (device: DatabaseDevice): string => {
    if (!device.last_seen_at) return "Never";
    
    const lastSeen = new Date(device.last_seen_at);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - lastSeen.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return {
    id: dbDevice.id,
    name: dbDevice.label,
    type: dbDevice.type,
    lastSeen: getLastSeenText(dbDevice),
    status: getDeviceStatus(dbDevice),
  };
}

function convertDatabaseLaneToUI(dbLane: DatabaseLane, devices: DatabaseDevice[]): Lane {
  const laneDevices = devices
    .filter(device => device.lane_id === dbLane.id)
    .map(convertDatabaseDeviceToUI);

  const hasOnlineDevices = laneDevices.some(device => device.status === "Online");
  
  return {
    id: dbLane.id,
    name: dbLane.name,
    status: hasOnlineDevices ? "Online" : "Offline",
    devices: laneDevices,
  };
}

interface StoreContextType {
  // Business Profile
  storeId: string | null;
  businessName: string;
  
  // Lanes and Devices
  lanes: Lane[];
  
  // Loading states
  loading: boolean;
  error: string | null;
  
  // Actions
  refreshLanes: () => Promise<void>;
  createLane: (name: string) => Promise<boolean>;
  updateLaneName: (laneId: string, newName: string) => Promise<boolean>;
  deleteLane: (laneId: string) => Promise<boolean>;
  generatePairingCode: (laneId: string, type: DeviceType) => Promise<{ code: string; expiresAt: Date } | null>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}

interface StoreProviderProps {
  children: ReactNode;
}

export function StoreProvider({ children }: StoreProviderProps) {
  const [storeId, setStoreId] = useState<string | null>(null);
  const [businessName, setBusinessName] = useState<string>("");
  const [lanes, setLanes] = useState<Lane[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load business profile and lanes data
  const loadStoreData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user
      const { data: userRes } = await supabase.auth.getUser();
      const user = userRes?.user;
      
      if (!user) {
        setError("No authenticated user");
        return;
      }

      // Get business profile
      const { data: profileData, error: profileError } = await supabase
        .from("business_profiles")
        .select("id, name")
        .limit(1)
        .maybeSingle();

      if (profileError) {
        setError(profileError.message);
        return;
      }

      if (!profileData) {
        setError("No business profile found");
        return;
      }

      setStoreId(profileData.id);
      setBusinessName(profileData.name);

      // Load lanes and devices in parallel
      const [lanesResult, devicesResult] = await Promise.all([
        supabase
          .from("lanes")
          .select("*")
          .eq("store_id", profileData.id)
          .eq("status", "active")
          .order("created_at", { ascending: true }),
        
        supabase
          .from("devices")
          .select("*")
          .eq("store_id", profileData.id)
          .eq("is_active", true)
      ]);

      if (lanesResult.error) {
        setError(lanesResult.error.message);
        return;
      }

      if (devicesResult.error) {
        setError(devicesResult.error.message);
        return;
      }

      const dbLanes = lanesResult.data as DatabaseLane[];
      const dbDevices = devicesResult.data as DatabaseDevice[];

      const uiLanes = dbLanes.map(lane => 
        convertDatabaseLaneToUI(lane, dbDevices)
      );

      setLanes(uiLanes);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load store data");
    } finally {
      setLoading(false);
    }
  };

  // Refresh lanes data
  const refreshLanes = async () => {
    if (!storeId) return;

    try {
      const [lanesResult, devicesResult] = await Promise.all([
        supabase
          .from("lanes")
          .select("*")
          .eq("store_id", storeId)
          .eq("status", "active")
          .order("created_at", { ascending: true }),
        
        supabase
          .from("devices")
          .select("*")
          .eq("store_id", storeId)
          .eq("is_active", true)
      ]);

      if (lanesResult.error || devicesResult.error) {
        console.error("Failed to refresh lanes:", lanesResult.error || devicesResult.error);
        return;
      }

      const dbLanes = lanesResult.data as DatabaseLane[];
      const dbDevices = devicesResult.data as DatabaseDevice[];

      const uiLanes = dbLanes.map(lane => 
        convertDatabaseLaneToUI(lane, dbDevices)
      );

      setLanes(uiLanes);
    } catch (err) {
      console.error("Failed to refresh lanes:", err);
    }
  };

  // Create lane
  const createLane = async (name: string): Promise<boolean> => {
    if (!storeId) return false;

    try {
      const { error } = await supabase
        .from("lanes")
        .insert({
          store_id: storeId,
          name: name.trim(),
          status: "active"
        });

      if (error) {
        setError(error.message);
        return false;
      }

      await refreshLanes();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create lane");
      return false;
    }
  };

  // Update lane name
  const updateLaneName = async (laneId: string, newName: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("lanes")
        .update({ name: newName.trim() })
        .eq("id", laneId);

      if (error) {
        setError(error.message);
        return false;
      }

      // Update local state
      setLanes(prev => prev.map(lane => 
        lane.id === laneId ? { ...lane, name: newName.trim() } : lane
      ));

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update lane");
      return false;
    }
  };

  // Delete lane
  const deleteLane = async (laneId: string): Promise<boolean> => {
    try {
      // First, unpair all devices from this lane
      const { error: devicesError } = await supabase
        .from("devices")
        .update({ lane_id: null, is_active: false })
        .eq("lane_id", laneId);

      if (devicesError) {
        setError(devicesError.message);
        return false;
      }

      // Then archive the lane
      const { error: laneError } = await supabase
        .from("lanes")
        .update({ status: "archived" })
        .eq("id", laneId);

      if (laneError) {
        setError(laneError.message);
        return false;
      }

      // Update local state
      setLanes(prev => prev.filter(lane => lane.id !== laneId));

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete lane");
      return false;
    }
  };

  // Generate pairing code
  const generatePairingCode = async (
    laneId: string,
    type: DeviceType
  ): Promise<{ code: string; expiresAt: Date } | null> => {
    if (!storeId) return null;

    try {
      // Get current user
      const { data: userRes } = await supabase.auth.getUser();
      const user = userRes?.user;
      
      if (!user) {
        throw new Error("No authenticated user");
      }

      // Generate expiration time (5 minutes from now)
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

      // Insert pairing code
      const { data, error } = await supabase
        .from("pairing_codes")
        .insert({
          store_id: storeId,
          lane_id: laneId,
          generated_by_user_id: user.id,
          expires_at: expiresAt.toISOString(),
        })
        .select("code")
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return {
        code: data.code,
        expiresAt,
      };
    } catch (err) {
      console.error("Failed to generate pairing code:", err);
      return null;
    }
  };

  // Load data on mount
  useEffect(() => {
    loadStoreData();
  }, []);

  const value: StoreContextType = {
    storeId,
    businessName,
    lanes,
    loading,
    error,
    refreshLanes,
    createLane,
    updateLaneName,
    deleteLane,
    generatePairingCode,
  };

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
}
