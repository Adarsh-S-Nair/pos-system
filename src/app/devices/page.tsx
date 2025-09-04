"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Button from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import Modal from "../components/ui/Modal";
import { useToast } from "../components/ui/ToastProvider";
import ContextMenu, { ContextMenuItem, ContextMenuSeparator } from "../components/ui/ContextMenu";
import {
  LuPlus,
  LuLink,
  LuUnlink,
  LuPencil,
  LuRotateCw,
  LuLayoutPanelLeft,
  LuMonitor,
  LuCreditCard,
  LuCopy,
  LuQrCode,
} from "react-icons/lu";
import { HiDotsVertical } from "react-icons/hi";

type DeviceType = "Register" | "Terminal" | "Display";
type DeviceStatus = "Online" | "Offline";

type Device = {
  id: string;
  name: string;
  type: DeviceType;
  lastSeen: string;
  status: DeviceStatus;
};

type Lane = {
  id: string;
  name: string;
  status: "Online" | "Offline";
  devices: Device[];
};

function Badge({ children, tone = "default" }: { children: React.ReactNode; tone?: "default" | "success" | "danger" }) {
  const styles = tone === "success"
    ? "bg-[color-mix(in_oklab,var(--color-accent),transparent_88%)] text-[var(--color-accent)] border border-[color-mix(in_oklab,var(--color-accent),transparent_70%)]"
    : tone === "danger"
    ? "bg-[color-mix(in_oklab,var(--color-danger),transparent_90%)] text-[var(--color-danger)] border border-[color-mix(in_oklab,var(--color-danger),transparent_70%)]"
    : "bg-[color-mix(in_oklab,var(--color-fg),transparent_94%)] text-[var(--color-muted)] border border-[var(--color-border)]";
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${styles}`}>{children}</span>
  );
}

function KebabMenu({ label = "Open menu", children }: { label?: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);
  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        className="rounded-md p-2 hover:bg-[color-mix(in_oklab,var(--color-fg),transparent_94%)] focus:outline-none focus-visible:ring-2"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={label}
        onClick={() => setOpen((v) => !v)}
      >
        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
          <path d="M10 3a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm0 5.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM11.5 16.5a1.5 1.5 0 10-3 0 1.5 1.5 0 003 0z" />
        </svg>
      </button>
      {open && (
        <div role="menu" className="absolute right-0 mt-2 w-44 overflow-hidden rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] shadow-lg">
          {children}
        </div>
      )}
    </div>
  );
}

function MenuItem({ onClick, children }: { onClick?: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className="block w-full px-3 py-2 text-left text-sm hover:bg-[color-mix(in_oklab,var(--color-fg),transparent_94%)]"
    >
      {children}
    </button>
  );
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-[color-mix(in_oklab,var(--color-fg),transparent_94%)] ${className}`} />;
}

function StatusDot({ tone }: { tone: "success" | "warn" | "muted" }) {
  const color = tone === "success" ? "var(--color-accent)" : tone === "warn" ? "var(--color-warn)" : "var(--color-muted)";
  const glow = `0 0 0 2px color-mix(in_oklab, ${color}, transparent 80%)`;
  return <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: color, boxShadow: glow }} aria-hidden />;
}

function IconButton({
  ariaLabel,
  onClick,
  children,
}: {
  ariaLabel: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={ariaLabel}
      aria-label={ariaLabel}
      onClick={onClick}
      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[var(--color-fg)] hover:bg-[color-mix(in_oklab,var(--color-fg),transparent_94%)] focus:outline-none focus-visible:ring-2 cursor-pointer"
    >
      {children}
    </button>
  );
}

function ConfirmModal({
  title,
  description,
  confirmText = "Confirm",
  open,
  onClose,
  onConfirm,
}: {
  title: string;
  description: string;
  confirmText?: string;
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={() => { onConfirm(); onClose(); }}>{confirmText}</Button>
        </>
      }
    />
  );
}

function CreateLaneModal({ open, onClose, onCreate }: { open: boolean; onClose: () => void; onCreate: (name: string) => void }) {
  const [name, setName] = useState("");
  useEffect(() => { if (!open) setName(""); }, [open]);
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create lane"
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={() => { if (name.trim()) { onCreate(name.trim()); onClose(); } }}>Create</Button>
        </>
      }
    >
      <div className="space-y-2">
        <label className="text-sm" htmlFor="lane-name">Name</label>
        <Input id="lane-name" placeholder="e.g., Lane 3" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
    </Modal>
  );
}

function PairDeviceModal({
  open,
  onClose,
  lanes,
  defaultLaneId,
  onGenerate,
}: {
  open: boolean;
  onClose: () => void;
  lanes: Lane[];
  defaultLaneId?: string;
  onGenerate: (laneId: string, type: DeviceType) => void;
}) {
  const [laneId, setLaneId] = useState<string>(defaultLaneId ?? (lanes[0]?.id ?? ""));
  const [type, setType] = useState<DeviceType>("Register");
  const [code, setCode] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number>(300);
  const [copied, setCopied] = useState<boolean>(false);
  useEffect(() => { if (!open) { setLaneId(defaultLaneId ?? (lanes[0]?.id ?? "")); setType("Register"); setCode(null); setRemaining(300); } }, [open, lanes, defaultLaneId]);
  useEffect(() => {
    if (!code) return;
    const id = window.setInterval(() => setRemaining((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => window.clearInterval(id);
  }, [code]);
  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");
  const doCopy = async () => {
    if (!code) return;
    try { await navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1200); } catch {}
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Pair device"
      size="md"
      footer={
        !code ? (
          <>
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button onClick={() => { const c = Math.random().toString(36).slice(2, 8).toUpperCase(); setCode(c); onGenerate(laneId, type); }}>Generate code</Button>
          </>
        ) : (
          <>
            <Button variant="secondary" onClick={() => setCode(Math.random().toString(36).slice(2, 8).toUpperCase())}>Regenerate</Button>
            <Button onClick={onClose}>Done</Button>
          </>
        )
      }
    >
      {!code ? (
        <div className="space-y-4">
          <div>
            <label className="text-sm" htmlFor="pair-lane">Lane</label>
            <Select id="pair-lane" value={laneId} onChange={(e) => setLaneId(e.target.value)}>
              {lanes.map((l) => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <div className="text-sm">Device type</div>
            <div className="inline-flex overflow-hidden rounded-md border border-[var(--color-border)]">
              {["Register","Terminal","Display"].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setType(opt as DeviceType)}
                  className={`px-3 py-1.5 text-sm ${type===opt?"bg-[color-mix(in_oklab,var(--color-fg),transparent_94%)]":"hover:bg-[color-mix(in_oklab,var(--color-fg),transparent_96%)]"}`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
          <p className="text-xs text-[var(--color-muted)]">On the new device open <span className="font-mono">/register</span> and enter this code.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-xs text-[var(--color-muted)]">One-time code</div>
            <div className="mt-1 inline-flex items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-4 text-4xl font-extrabold tracking-widest">
              {code}
            </div>
            <div className="mt-2 flex items-center justify-center gap-2 text-sm text-[var(--color-muted)]">
              <span>Expires in {mm}:{ss}</span>
              <span aria-hidden>•</span>
              <button type="button" title={copied?"Copied":"Copy code"} aria-label="Copy code" onClick={doCopy} className="inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-[color-mix(in_oklab,var(--color-fg),transparent_94%)]">
                <LuCopy className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="inline-flex items-center gap-2 rounded-md border border-[var(--color-border)] px-3 py-2 text-xs text-[var(--color-muted)]">
              <LuQrCode className="h-4 w-4" />
              <span>QR coming soon</span>
            </div>
          </div>
          <p className="text-xs text-center text-[var(--color-muted)]">On the new device open <span className="font-mono">/register</span> and enter this code.</p>
        </div>
      )}
    </Modal>
  );
}

function TableHeaderCell({ children }: { children: React.ReactNode }) { return <th className="px-3 py-2 text-left text-xs font-semibold text-[var(--color-muted)]">{children}</th>; }
function TableCell({ children }: { children: React.ReactNode }) { return <td className="px-3 py-2 text-sm">{children}</td>; }

export default function DevicesPage() {
  const { setToast } = useToast();
  const [loading, setLoading] = useState<boolean>(true);
  const [lanes, setLanes] = useState<Lane[]>([]);

  // Mock initial data
  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setLanes([
        {
          id: "lane-1",
          name: "Lane 1",
          status: "Online",
          devices: [
            { id: "d1", name: "Front Register", type: "Register", lastSeen: "Just now", status: "Online" },
            { id: "d2", name: "Kitchen Display", type: "Display", lastSeen: "2h ago", status: "Offline" },
          ],
        },
        {
          id: "lane-2",
          name: "Lane 2",
          status: "Online",
          devices: [
            { id: "d3", name: "Bar Register", type: "Register", lastSeen: "5m ago", status: "Online" },
          ],
        },
      ]);
      setLoading(false);
    }, 600);
    return () => window.clearTimeout(timeout);
  }, []);

  const [createOpen, setCreateOpen] = useState(false);
  const [pairOpen, setPairOpen] = useState(false);
  const [pairDefaultLane, setPairDefaultLane] = useState<string | undefined>(undefined);
  const [confirm, setConfirm] = useState<{ open: boolean; title: string; description: string; onConfirm: () => void }>({ open: false, title: "", description: "", onConfirm: () => {} });

  const openPairForLane = (laneId?: string) => {
    setPairDefaultLane(laneId);
    setPairOpen(true);
  };

  const renameLane = (laneId: string) => {
    const lane = lanes.find((l) => l.id === laneId);
    const next = window.prompt("Rename lane", lane?.name ?? "");
    if (next && next.trim()) {
      setLanes((prev) => prev.map((l) => (l.id === laneId ? { ...l, name: next.trim() } : l)));
      setToast({ title: "Lane renamed", variant: "success" });
    }
  };

  const unpairLane = (laneId: string) => {
    setConfirm({
      open: true,
      title: "Unpair lane",
      description: "This will unpair all devices from this lane.",
      onConfirm: () => {
        setLanes((prev) => prev.map((l) => (l.id === laneId ? { ...l, devices: [] } : l)));
        setToast({ title: "Lane unpaired", variant: "success" });
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
      onConfirm: () => {
        setLanes((prev) => prev.map((l) => (l.id === laneId ? { ...l, devices: l.devices.filter((d) => d.id !== deviceId) } : l)));
        setToast({ title: "Device unpaired", variant: "success" });
      },
    });
  };

  const replaceDevice = (laneId: string, deviceId: string) => {
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

  const onCreateLane = (name: string) => {
    setLanes((prev) => [...prev, { id: Math.random().toString(36).slice(2), name, status: "Online", devices: [] }]);
    setToast({ title: "Lane created", description: name, variant: "success" });
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
        <div className="divide-y divide-[var(--color-border)]">
          {[0,1,2].map((i) => (
            <div key={i} className="py-6">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-5 w-20" />
              </div>
              <div className="mt-4 space-y-3">
                {[0,1].map((r) => <Skeleton key={r} className="h-6 w-full" />)}
              </div>
            </div>
          ))}
        </div>
      ) : lanes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-sm">
            <div className="h-24 w-24 rounded-xl bg-[color-mix(in_oklab,var(--color-fg),transparent_94%)]" aria-hidden />
          </div>
          <h3 className="mt-6 text-lg font-semibold">No lanes yet</h3>
          <p className="mt-1 text-sm text-[var(--color-muted)]">Create your first lane and start pairing devices.</p>
          <Button className="mt-4" onClick={() => setCreateOpen(true)}>Create lane</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {lanes.map((lane) => {
            const online = lane.devices.some((d) => d.status === "Online");
            return (
              <section key={lane.id} className="rounded-lg bg-[var(--color-surface)] p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <LuLayoutPanelLeft className="h-5 w-5" aria-hidden />
                      <span className="truncate text-base font-semibold">{lane.name}</span>
                      <StatusDot tone={online ? "success" : "muted"} />
                    </div>
                    <div className="mt-1 truncate text-sm text-[var(--color-muted)]">Open shift • {lane.devices.filter(d=>d.status==="Online").length} active devices</div>
                  </div>
                  <ContextMenu
                    trigger={
                      <div className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[var(--color-fg)] hover:bg-[color-mix(in_oklab,var(--color-fg),transparent_94%)] focus:outline-none focus-visible:ring-2 cursor-pointer">
                        <HiDotsVertical className="h-4 w-4" />
                      </div>
                    }
                  >
                    <ContextMenuItem icon={<LuPencil className="h-4 w-4" />} onClick={() => renameLane(lane.id)}>
                      Rename lane
                    </ContextMenuItem>
                    <ContextMenuItem icon={<LuLink className="h-4 w-4" />} onClick={() => pairRegister(lane.id)}>
                      Pair device
                    </ContextMenuItem>
                    <ContextMenuItem icon={<LuRotateCw className="h-4 w-4" />} onClick={() => replaceRegister(lane.id)}>
                      Replace register
                    </ContextMenuItem>
                    <ContextMenuSeparator />
                    <ContextMenuItem icon={<LuUnlink className="h-4 w-4" />} onClick={() => unpairLane(lane.id)} destructive>
                      Unpair lane
                    </ContextMenuItem>
                  </ContextMenu>
                </div>

                {lane.devices.length === 0 ? (
                  <div className="mt-4 flex items-center justify-between gap-3 rounded-md bg-[color-mix(in_oklab,var(--color-fg),transparent_96%)] px-3 py-3">
                    <div className="text-sm text-[var(--color-muted)]">No devices paired yet</div>
                    <IconButton ariaLabel="Pair device" onClick={() => pairRegister(lane.id)}><LuLink className="h-4 w-4" /></IconButton>
                  </div>
                ) : (
                  <ul className="mt-4 space-y-2">
                    {lane.devices.map((d) => {
                      const icon = d.type === "Register" ? <LuMonitor className="h-4 w-4" /> : d.type === "Terminal" ? <LuCreditCard className="h-4 w-4" /> : <LuMonitor className="h-4 w-4" />;
                      const tone = d.status === "Online" ? "success" : "muted" as const;
                      return (
                        <li key={d.id} className="flex items-center justify-between gap-4 rounded-md bg-[color-mix(in_oklab,var(--color-fg),transparent_96%)] px-3 py-3">
                          <div className="flex min-w-0 items-start gap-3">
                            <div className="mt-1 text-[var(--color-muted)]">{icon}</div>
                            <div className="min-w-0">
                              <div className="truncate text-sm font-medium">{d.name}</div>
                              <div className="mt-1 truncate text-xs text-[var(--color-muted)]">{d.type} • Chrome • Windows</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <StatusDot tone={tone} />
                            <span className="text-xs text-[var(--color-muted)]">{d.lastSeen}</span>
                            <ContextMenu
                              trigger={
                                <div className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[var(--color-fg)] hover:bg-[color-mix(in_oklab,var(--color-fg),transparent_94%)] focus:outline-none focus-visible:ring-2 cursor-pointer">
                                  <HiDotsVertical className="h-3 w-3" />
                                </div>
                              }
                            >
                              <ContextMenuItem icon={<LuRotateCw className="h-4 w-4" />} onClick={() => replaceDevice(lane.id, d.id)}>
                                Replace device
                              </ContextMenuItem>
                              <ContextMenuItem icon={<LuUnlink className="h-4 w-4" />} onClick={() => unpairDevice(lane.id, d.id)} destructive>
                                Unpair device
                              </ContextMenuItem>
                            </ContextMenu>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
      )}

      <CreateLaneModal open={createOpen} onClose={() => setCreateOpen(false)} onCreate={onCreateLane} />
      <PairDeviceModal open={pairOpen} onClose={() => setPairOpen(false)} lanes={lanes} defaultLaneId={pairDefaultLane} onGenerate={onGenerateCode} />
      <ConfirmModal open={confirm.open} title={confirm.title} description={confirm.description} onClose={() => setConfirm((c) => ({ ...c, open: false }))} onConfirm={confirm.onConfirm} />
    </div>
  );
}

