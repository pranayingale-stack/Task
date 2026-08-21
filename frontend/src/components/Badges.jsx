const STATUS_STYLES = {
  Pending: 'bg-clay/10 text-clay-dark border-clay/30',
  'In Progress': 'bg-amber/10 text-amber-dark border-amber/40',
  Completed: 'bg-sage/15 text-sage-dark border-sage/40',
};

const PRIORITY_STYLES = {
  Low: 'bg-slate/10 text-slate border-slate/30',
  Medium: 'bg-amber/10 text-amber-dark border-amber/40',
  High: 'bg-clay/10 text-clay-dark border-clay/40',
};

export function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-mono font-medium ${
        STATUS_STYLES[status] || STATUS_STYLES.Pending
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  return (
    <span
      className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-mono font-medium uppercase tracking-wide ${
        PRIORITY_STYLES[priority] || PRIORITY_STYLES.Medium
      }`}
    >
      {priority}
    </span>
  );
}
