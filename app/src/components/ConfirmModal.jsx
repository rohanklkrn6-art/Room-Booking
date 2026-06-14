export default function ConfirmModal({ isOpen, title, body, confirmLabel = 'Confirm', danger = true, onCancel, onConfirm }) {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="modal">
        <div className="modal-title">{title}</div>
        {body && <div className="modal-body">{body}</div>}
        <div className="modal-btns">
          <button className="modal-cancel" onClick={onCancel}>Cancel</button>
          <button className={`modal-confirm${danger ? '' : ' safe'}`} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
