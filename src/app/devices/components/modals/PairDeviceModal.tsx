import { useEffect, useState } from "react";
import Modal from "../../../components/ui/Modal";
import Button from "../../../components/ui/Button";
import { Select } from "../../../components/ui/Select";
import { LuCopy, LuQrCode } from "react-icons/lu";
import { DeviceType, Lane } from "../../types";
import { useStore } from "../../../contexts/StoreContext";

interface PairDeviceModalProps {
  open: boolean;
  onClose: () => void;
  lanes: Lane[];
  defaultLaneId?: string;
  onGenerate: (laneId: string, type: DeviceType) => void;
}

export default function PairDeviceModal({
  open,
  onClose,
  lanes,
  defaultLaneId,
  onGenerate,
}: PairDeviceModalProps) {
  const { savePairingCode } = useStore();
  const [laneId, setLaneId] = useState<string>(defaultLaneId ?? (lanes[0]?.id ?? ""));
  const [type, setType] = useState<DeviceType>("Register");
  const [code, setCode] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number>(60);
  const [copied, setCopied] = useState<boolean>(false);
  
  useEffect(() => { 
    if (!open) { 
      setLaneId(defaultLaneId ?? (lanes[0]?.id ?? "")); 
      setType("Register"); 
      setCode(null); 
      setRemaining(60); 
    } 
  }, [open, lanes, defaultLaneId]);
  
  useEffect(() => {
    if (!code || typeof window === "undefined") return;
    const id = window.setInterval(() => setRemaining((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => window.clearInterval(id);
  }, [code]);
  
  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");
  
  const doCopy = async () => {
    if (!code || typeof window === "undefined") return;
    try { 
      await navigator.clipboard.writeText(code); 
      setCopied(true); 
      setTimeout(() => setCopied(false), 1200); 
    } catch {}
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
            <Button 
              onClick={async () => { 
                const c = Math.random().toString(36).slice(2, 8).toUpperCase(); 
                setCode(c);
                void savePairingCode(laneId, c);
                onGenerate(laneId, type); 
              }}
            >
              Generate code
            </Button>
          </>
        ) : (
          <>
            <Button 
              variant="secondary" 
              onClick={() => { 
                setCode(Math.random().toString(36).slice(2, 8).toUpperCase());
                setRemaining(60);
              }}
            >
              Regenerate
            </Button>
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
                  className={`px-3 py-1.5 text-sm ${
                    type===opt
                      ?"bg-[color-mix(in_oklab,var(--color-fg),transparent_94%)]"
                      :"hover:bg-[color-mix(in_oklab,var(--color-fg),transparent_96%)]"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
          <p className="text-xs text-[var(--color-muted)]">
            On the new device open <span className="font-mono">/register</span> and enter this code.
          </p>
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
              <button 
                type="button" 
                title={copied?"Copied":"Copy code"} 
                aria-label="Copy code" 
                onClick={doCopy} 
                className="inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-[color-mix(in_oklab,var(--color-fg),transparent_94%)]"
              >
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
          <p className="text-xs text-center text-[var(--color-muted)]">
            On the new device open <span className="font-mono">/register</span> and enter this code.
          </p>
        </div>
      )}
    </Modal>
  );
}
