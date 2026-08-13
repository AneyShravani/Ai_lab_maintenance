import React from 'react';
import './Modal.css';

function Modal({ isOpen, title, onClose, children, size = 'default' }) { // NEW: size prop, defaults to normal width
  if (!isOpen) {
    return null;
  }

  // NEW: picks the wide class only when explicitly requested — every existing
  // <Modal> call in your app keeps working exactly as before, unchanged
  const cardClassName = size === 'wide' ? 'modal-card modal-card-wide' : 'modal-card';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={cardClassName} onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose} type="button">
            ×
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

export default Modal;