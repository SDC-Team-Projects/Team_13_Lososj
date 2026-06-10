import Modal from "./Modal";

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
    >
      <p>{message}</p>

      <div className="modalActions">
        <button onClick={onClose}>
          {cancelText}
        </button>

        <button onClick={onConfirm}>
          {confirmText}
        </button>
      </div>
    </Modal>
  );
}