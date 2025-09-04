import { LuLayoutPanelLeft, LuPencil, LuLink, LuRotateCw, LuUnlink } from "react-icons/lu";
import { HiDotsVertical } from "react-icons/hi";
import ContextMenu, { ContextMenuItem, ContextMenuSeparator } from "../../components/ui/ContextMenu";
import IconButton from "./ui/IconButton";
import StatusDot from "./ui/StatusDot";
import DeviceItem from "./DeviceItem";
import { Lane } from "../types";

interface LaneCardProps {
  lane: Lane;
  onRename: (laneId: string) => void;
  onPairDevice: (laneId: string) => void;
  onReplaceRegister: (laneId: string) => void;
  onUnpairLane: (laneId: string) => void;
  onReplaceDevice: (laneId: string) => void;
  onUnpairDevice: (laneId: string, deviceId: string) => void;
}

export default function LaneCard({
  lane,
  onRename,
  onPairDevice,
  onReplaceRegister,
  onUnpairLane,
  onReplaceDevice,
  onUnpairDevice,
}: LaneCardProps) {
  const online = lane.devices.some((d) => d.status === "Online");

  return (
    <section className="rounded-lg bg-[var(--color-surface)] p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <LuLayoutPanelLeft className="h-5 w-5" aria-hidden />
            <span className="truncate text-base font-semibold">{lane.name}</span>
            <StatusDot tone={online ? "success" : "muted"} />
          </div>
          <div className="mt-1 truncate text-sm text-[var(--color-muted)]">
            Open shift • {lane.devices.filter(d=>d.status==="Online").length} active devices
          </div>
        </div>
        <ContextMenu
          trigger={
            <div className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[var(--color-fg)] hover:bg-[color-mix(in_oklab,var(--color-fg),transparent_94%)] focus:outline-none focus-visible:ring-2 cursor-pointer">
              <HiDotsVertical className="h-4 w-4" />
            </div>
          }
        >
          <ContextMenuItem icon={<LuPencil className="h-4 w-4" />} onClick={() => onRename(lane.id)}>
            Rename lane
          </ContextMenuItem>
          <ContextMenuItem icon={<LuLink className="h-4 w-4" />} onClick={() => onPairDevice(lane.id)}>
            Pair device
          </ContextMenuItem>
          <ContextMenuItem icon={<LuRotateCw className="h-4 w-4" />} onClick={() => onReplaceRegister(lane.id)}>
            Replace register
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem icon={<LuUnlink className="h-4 w-4" />} onClick={() => onUnpairLane(lane.id)} destructive>
            Unpair lane
          </ContextMenuItem>
        </ContextMenu>
      </div>

      {lane.devices.length === 0 ? (
        <div className="mt-4 flex items-center justify-between gap-3 rounded-md bg-[color-mix(in_oklab,var(--color-fg),transparent_96%)] px-3 py-3">
          <div className="text-sm text-[var(--color-muted)]">No devices paired yet</div>
          <IconButton ariaLabel="Pair device" onClick={() => onPairDevice(lane.id)}>
            <LuLink className="h-4 w-4" />
          </IconButton>
        </div>
      ) : (
        <ul className="mt-4 space-y-2">
          {lane.devices.map((device) => (
            <DeviceItem
              key={device.id}
              device={device}
              onReplace={() => onReplaceDevice(lane.id)}
              onUnpair={() => onUnpairDevice(lane.id, device.id)}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
