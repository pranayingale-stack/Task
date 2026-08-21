import { StatusBadge, PriorityBadge } from './Badges';

const STATUS_OPTIONS = ['Pending', 'In Progress', 'Completed'];

function formatDeadline(deadline) {
  if (!deadline) return 'No deadline';
  const d = new Date(deadline);
  if (Number.isNaN(d.getTime())) return deadline;
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

export function TaskCard({ task, canManage, onEdit, onDelete, onStatusChange, statusUpdating }) {
  const isOverdue =
    task.deadline && task.status !== 'Completed' && new Date(task.deadline) < new Date(new Date().toDateString());

  return (
    <div className="ticket-notch relative rounded-lg border border-ink/10 bg-white p-4 shadow-ticket">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-display text-base font-semibold text-ink">{task.title}</h3>
          {task.description && <p className="mt-1 line-clamp-2 text-sm text-ink/60">{task.description}</p>}
        </div>
        <PriorityBadge priority={task.priority} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 font-mono text-xs text-ink/50">
        <span>Assigned: {task.assignee_name}</span>
        <span className={isOverdue ? 'font-semibold text-clay-dark' : ''}>
          Due: {formatDeadline(task.deadline)}
          {isOverdue && ' (overdue)'}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-dashed border-ink/10 pt-3">
        {onStatusChange ? (
          <select
            aria-label={`Update status for ${task.title}`}
            value={task.status}
            disabled={statusUpdating}
            onChange={(e) => onStatusChange(task, e.target.value)}
            className="rounded-md border border-ink/20 bg-white px-2 py-1 text-xs font-mono focus:border-clay focus:outline-none disabled:opacity-50"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        ) : (
          <StatusBadge status={task.status} />
        )}

        {canManage && (
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(task)}
              className="rounded-md px-2 py-1 text-xs font-medium text-ink/70 hover:bg-ink/5 hover:text-ink"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(task)}
              className="rounded-md px-2 py-1 text-xs font-medium text-clay-dark hover:bg-clay/10"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
