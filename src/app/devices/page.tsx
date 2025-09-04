"use client";

import { useState } from "react";
import { useToast } from "../components/ui/ToastProvider";
import { LuPlus, LuLink } from "react-icons/lu";
import { DeviceType } from "./types";
import IconButton from "./components/ui/IconButton";
import LaneCard from "./components/LaneCard";
import LoadingState from "./components/LoadingState";
import EmptyState from "./components/EmptyState";
import CreateLaneModal from "./components/modals/CreateLaneModal";
import PairDeviceModal from "./components/modals/PairDeviceModal";
import ConfirmModal from "./components/modals/ConfirmModal";
import { useStore } from "../contexts/StoreContext";




export default function DevicesPage() {
  const { setToast } = useToast();
  const { lanes, loading, createLane, updateLaneName } = useStore();

  const [createOpen, setCreateOpen] = useState(false);
  const [pairOpen, setPairOpen] = useState(false);
  const [pairDefaultLane, setPairDefaultLane] = useState<string | undefined>(undefined);
  const [confirm, setConfirm] = useState<{ open: boolean; title: string; description: string; onConfirm: () => void }>({ open: false, title: "", description: "", onConfirm: () => {} });

  const openPairForLane = (laneId?: string) => {
    setPairDefaultLane(laneId);
    setPairOpen(true);
  };

  const renameLane = (laneId: string) => {
    if (typeof window === "undefined") return;
    const lane = lanes.find((l) => l.id === laneId);
    const next = window.prompt("Rename lane", lane?.name ?? "");
    if (next && next.trim()) {
      void updateLaneName(laneId, next.trim()).then((ok) => {
        setToast({ title: ok ? "Lane renamed" : "Failed to rename lane", variant: ok ? "success" : "error" });
      });
    }
  };

  const unpairLane = (_laneId: string) => {
    setConfirm({
      open: true,
      title: "Unpair lane",
      description: "This will unpair all devices from this lane.",
      onConfirm: () => {
        // For now, we only clear devices client-side; server deletion would be separate.
        // After implementing, call refresh() in StoreContext.
        setToast({ title: "Lane unpaired", variant: "success" });
      },
    });
  };

  const pairRegister = (laneId: string) => openPairForLane(laneId);
  const replaceRegister = (laneId: string) => openPairForLane(laneId);

  const unpairDevice = (_laneId: string, _deviceId: string) => {
    setConfirm({
      open: true,
      title: "Unpair device",
      description: "The device will be disconnected from this lane.",
      onConfirm: () => {
        setToast({ title: "Device unpaired", variant: "success" });
      },
    });
  };

  const replaceDevice = (laneId: string) => {
    setConfirm({
      open: true,
      title: "Replace device",
      description: "The current device will be replaced after pairing a new one.",
      onConfirm: () => {
        openPairForLane(laneId);
        setToast({ title: "Generate code to replace", variant: "info" });
      },
    });
  };

  const onCreateLane = async (name: string) => {
    const ok = await createLane(name);
    setToast({ title: ok ? "Lane created" : "Failed to create lane", description: name, variant: ok ? "success" : "error" });
  };

  const onGenerateCode = (laneId: string, type: DeviceType) => {
    setToast({ title: "Code generated", description: `${type} • ${lanes.find((l) => l.id === laneId)?.name ?? "Lane"}`, variant: "success" });
  };

  const headerActions = (
    <div className="flex items-center gap-1">
      <IconButton ariaLabel="Create lane" onClick={() => setCreateOpen(true)}><LuPlus className="h-4 w-4" /></IconButton>
      <IconButton ariaLabel="Pair new device" onClick={() => openPairForLane()}><LuLink className="h-4 w-4" /></IconButton>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="sticky top-0 z-10 -mx-4 flex items-center justify-between gap-4 border-b border-[var(--color-border)] bg-[var(--color-content-bg)]/80 px-4 py-4 backdrop-blur supports-[backdrop-filter]:bg-[color-mix(in_oklab,var(--color-content-bg),transparent_6%)] sm:rounded-none">
        <div>
          <h1 className="text-2xl font-semibold">Devices & Lanes</h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">Manage registers and peripherals across lanes.</p>
        </div>
        {headerActions}
      </div>

      {loading ? (
        <LoadingState />
      ) : lanes.length === 0 ? (
        <EmptyState onCreateLane={() => setCreateOpen(true)} />
      ) : (
        <div className="space-y-3">
          {lanes.map((lane) => (
            <LaneCard
              key={lane.id}
              lane={lane}
              onRename={renameLane}
              onPairDevice={pairRegister}
              onReplaceRegister={replaceRegister}
              onUnpairLane={unpairLane}
              onReplaceDevice={replaceDevice}
              onUnpairDevice={unpairDevice}
            />
          ))}
        </div>
      )}

      <CreateLaneModal open={createOpen} onClose={() => setCreateOpen(false)} onCreate={onCreateLane} />
      <PairDeviceModal open={pairOpen} onClose={() => setPairOpen(false)} lanes={lanes} defaultLaneId={pairDefaultLane} onGenerate={onGenerateCode} />
      <ConfirmModal open={confirm.open} title={confirm.title} description={confirm.description} onClose={() => setConfirm((c) => ({ ...c, open: false }))} onConfirm={confirm.onConfirm} />
    </div>
  );
}

