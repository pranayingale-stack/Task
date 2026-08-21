export function ConfirmDialog({ open, title, description, confirmLabel = 'Confirm', onConfirm, onCancel, danger = true }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-lg border border-ink/10 bg-sand-light p-5 shadow-ticket">
        <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
        {description && <p className="mt-2 text-sm text-ink/70">{description}</p>}
        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-md border border-ink/20 px-3 py-1.5 text-sm font-medium text-ink hover:bg-ink/5"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`rounded-md px-3 py-1.5 text-sm font-medium text-white ${
              danger ? 'bg-clay hover:bg-clay-dark' : 'bg-ink hover:bg-ink-light'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
