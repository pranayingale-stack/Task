export function LoadingState({ label = 'Loading tasks…' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-ink/60">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink/20 border-t-clay" />
      <p className="font-mono text-xs uppercase tracking-widest">{label}</p>
    </div>
  );
}

export function EmptyState({ title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-ink/20 bg-white/50 py-16 text-center">
      <p className="font-display text-lg font-semibold text-ink">{title}</p>
      {description && <p className="max-w-sm text-sm text-ink/60">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-clay/30 bg-clay/5 py-12 text-center">
      <p className="font-medium text-clay-dark">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-md border border-clay/40 px-3 py-1.5 text-sm font-medium text-clay-dark hover:bg-clay/10"
        >
          Try again
        </button>
      )}
    </div>
  );
}
