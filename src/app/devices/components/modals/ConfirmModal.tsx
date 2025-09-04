import Modal from "../../../components/ui/Modal";
import Button from "../../../components/ui/Button";

interface ConfirmModalProps {
  title: string;
  description: string;
  confirmText?: string;
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ConfirmModal({
  title,
  description,
  confirmText = "Confirm",
  open,
  onClose,
  onConfirm,
}: ConfirmModalProps) {
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
