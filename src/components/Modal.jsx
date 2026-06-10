import { createPortal } from "react-dom";
import "../css/Modal.css";

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
}) {
  if (!isOpen) return null;

  return createPortal(
    <div
      className="modalOverlay"
      onClick={onClose}
    >
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
      >
        {title && <h3>{title}</h3>}

        <div className="modalContent">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}