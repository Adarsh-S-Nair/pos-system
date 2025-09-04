import { LuMonitor, LuCreditCard, LuRotateCw, LuUnlink } from "react-icons/lu";
import { HiDotsVertical } from "react-icons/hi";
import ContextMenu, { ContextMenuItem } from "../../components/ui/ContextMenu";
import StatusDot from "./ui/StatusDot";
import { Device } from "../types";

interface DeviceItemProps {
  device: Device;
  onReplace: () => void;
  onUnpair: () => void;
}

export default function DeviceItem({ device, onReplace, onUnpair }: DeviceItemProps) {
  const icon = device.type === "REGISTER" 
    ? <LuMonitor className="h-4 w-4" /> 
    : device.type === "TERMINAL" 
    ? <LuCreditCard className="h-4 w-4" /> 
    : <LuMonitor className="h-4 w-4" />;
  
  const tone = device.status === "Online" ? "success" : "muted" as const;

  return (
    <li className="flex items-center justify-between gap-4 rounded-md bg-[color-mix(in_oklab,var(--color-fg),transparent_96%)] px-3 py-3">
      <div className="flex min-w-0 items-start gap-3">
        <div className="mt-1 text-[var(--color-muted)]">{icon}</div>
        <div className="min-w-0">
          <div className="truncate text-sm font-medium">{device.name}</div>
          <div className="mt-1 truncate text-xs text-[var(--color-muted)]">
            {device.type} • Chrome • Windows
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <StatusDot tone={tone} />
        <span className="text-xs text-[var(--color-muted)]">{device.lastSeen}</span>
        <ContextMenu
          trigger={
            <div className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[var(--color-fg)] hover:bg-[color-mix(in_oklab,var(--color-fg),transparent_94%)] focus:outline-none focus-visible:ring-2 cursor-pointer">
              <HiDotsVertical className="h-3 w-3" />
            </div>
          }
        >
          <ContextMenuItem icon={<LuRotateCw className="h-4 w-4" />} onClick={onReplace}>
            Replace device
          </ContextMenuItem>
          <ContextMenuItem icon={<LuUnlink className="h-4 w-4" />} onClick={onUnpair} destructive>
            Unpair device
          </ContextMenuItem>
        </ContextMenu>
      </div>
    </li>
  );
}
