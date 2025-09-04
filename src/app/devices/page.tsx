"use client";

import React, { useState } from "react";
import { useToast } from "../components/ui/ToastProvider";
import { LuPlus, LuLink } from "react-icons/lu";
import { DeviceType } from "./types";
import { useStore } from "../contexts/StoreContext";
import IconButton from "./components/ui/IconButton";
import LaneCard from "./components/LaneCard";
import EmptyState from "./components/EmptyState";
import CreateLaneModal from "./components/modals/CreateLaneModal";
import PairDeviceModal from "./components/modals/PairDeviceModal";
import ConfirmModal from "./components/modals/ConfirmModal";




export default function DevicesPage() {
  const { setToast } = useToast();
  const { 
    storeId, 
    lanes, 
    error, 
    createLane, 
    updateLaneName, 
    deleteLane, 
    generatePairingCode 
  } = useStore();

  // Show error toasts
  React.useEffect(() => {
    if (error) {
      setToast({ title: "Error loading store data", description: error, variant: "error" });
    }
  }, [error, setToast]);

  const [createOpen, setCreateOpen] = useState(false);
  const [pairOpen, setPairOpen] = useState(false);
  const [pairDefaultLane, setPairDefaultLane] = useState<string | undefined>(undefined);
  const [confirm, setConfirm] = useState<{ open: boolean; title: string; description: string; onConfirm: () => void }>({ open: false, title: "", description: "", onConfirm: () => {} });

  const openPairForLane = (laneId?: string) => {
    setPairDefaultLane(laneId);
    setPairOpen(true);
  };

  const renameLane = async (laneId: string) => {
    if (typeof window === "undefined") return;
    const lane = lanes.find((l) => l.id === laneId);
    const next = window.prompt("Rename lane", lane?.name ?? "");
    if (next && next.trim()) {
      const success = await updateLaneName(laneId, next.trim());
      if (success) {
      setToast({ title: "Lane renamed", variant: "success" });
      } else {
        setToast({ title: "Failed to rename lane", variant: "error" });
      }
    }
  };

  const unpairLane = (laneId: string) => {
    setConfirm({
      open: true,
      title: "Unpair lane",
      description: "This will unpair all devices from this lane.",
      onConfirm: async () => {
        const success = await deleteLane(laneId);
        if (success) {
        setToast({ title: "Lane unpaired", variant: "success" });
        } else {
          setToast({ title: "Failed to unpair lane", variant: "error" });
        }
      },
    });
  };

  const pairRegister = (laneId: string) => openPairForLane(laneId);
  const replaceRegister = (laneId: string) => openPairForLane(laneId);

  const unpairDevice = (laneId: string, deviceId: string) => {
    setConfirm({
      open: true,
      title: "Unpair device",
      description: "The device will be disconnected from this lane.",
      onConfirm: async () => {
        // TODO: Implement device unpairing
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
    const success = await createLane(name);
    if (success) {
    setToast({ title: "Lane created", description: name, variant: "success" });
    } else {
      setToast({ title: "Failed to create lane", variant: "error" });
    }
  };

  const onGenerateCode = async (laneId: string, type: DeviceType) => {
    if (!storeId) {
      setToast({ title: "No store ID available", variant: "error" });
      return;
    }

    const result = await generatePairingCode(laneId, type);
    if (result) {
      setToast({ 
        title: "Code generated", 
        description: `${type} • ${lanes.find((l) => l.id === laneId)?.name ?? "Lane"}`, 
        variant: "success" 
      });
    } else {
      setToast({ title: "Failed to generate code", variant: "error" });
    }
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

      {lanes.length === 0 ? (
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

