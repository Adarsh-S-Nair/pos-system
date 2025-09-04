import { useEffect, useState } from "react";
import Modal from "../../../components/ui/Modal";
import Button from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";

interface CreateLaneModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
}

export default function CreateLaneModal({ 
  open, 
  onClose, 
  onCreate 
}: CreateLaneModalProps) {
  const [name, setName] = useState("");
  
  useEffect(() => { 
    if (!open) setName(""); 
  }, [open]);
  
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create lane"
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={() => { 
              if (name.trim()) { 
                onCreate(name.trim()); 
                onClose(); 
              } 
            }}
          >
            Create
          </Button>
        </>
      }
    >
      <div className="space-y-2">
        <label className="text-sm" htmlFor="lane-name">Name</label>
        <Input 
          id="lane-name" 
          placeholder="e.g., Lane 3" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
        />
      </div>
    </Modal>
  );
}
