export type DeviceType = "REGISTER" | "TERMINAL" | "CUSTOMER_DISPLAY";
export type DeviceStatus = "Online" | "Offline";
export type LaneStatus = "active" | "archived";

// Database types (matching Supabase schema)
export type DatabaseDevice = {
  id: string;
  store_id: string;
  lane_id: string | null;
  type: DeviceType;
  label: string;
  device_public_id: string | null;
  device_token_hash: string | null;
  paired_at: string | null;
  last_seen_at: string | null;
  revoked_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type DatabaseLane = {
  id: string;
  store_id: string;
  name: string;
  status: LaneStatus;
  created_at: string;
  updated_at: string;
};

// UI types (for display purposes)
export type Device = {
  id: string;
  name: string;
  type: DeviceType;
  lastSeen: string;
  status: DeviceStatus;
};

export type Lane = {
  id: string;
  name: string;
  status: "Online" | "Offline";
  devices: Device[];
};
