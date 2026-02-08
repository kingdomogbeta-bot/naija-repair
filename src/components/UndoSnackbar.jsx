import { useEffect } from 'react';

export default function UndoSnackbar({ open, message, actionLabel = 'Undo', onAction, onClose, duration = 5000 }) {
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => onClose && onClose(), duration);
    return () => clearTimeout(t);
  }, [open, duration, onClose]);

  if (!open) return null;
  return (
    <div className="fixed left-1/2 bottom-6 -translate-x-1/2 z-50">
      <div className="bg-white border rounded shadow px-4 py-2 flex items-center gap-4">
        <div className="text-sm text-gray-700">{message}</div>
        <button onClick={onAction} className="text-sm text-teal-600 font-semibold">{actionLabel}</button>
        <button onClick={onClose} className="text-xs text-gray-400 ml-2">✕</button>
      </div>
    </div>
  );
}
