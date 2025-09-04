export type DeviceType = "Register" | "Terminal" | "Display";
export type DeviceStatus = "Online" | "Offline";

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
