const STATUSES = ['Pending', 'In Progress', 'Completed'];
const PRIORITIES = ['Low', 'Medium', 'High'];

export function FilterBar({ filters, onChange, members }) {
  const update = (key, value) => onChange({ ...filters, [key]: value });

  const selectClass =
    'rounded-md border border-ink/20 bg-white px-3 py-1.5 text-sm text-ink focus:border-clay focus:outline-none';

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        aria-label="Filter by status"
        value={filters.status || ''}
        onChange={(e) => update('status', e.target.value)}
        className={selectClass}
      >
        <option value="">All statuses</option>
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      <select
        aria-label="Filter by priority"
        value={filters.priority || ''}
        onChange={(e) => update('priority', e.target.value)}
        className={selectClass}
      >
        <option value="">All priorities</option>
        {PRIORITIES.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>

      {members && (
        <select
          aria-label="Filter by assigned member"
          value={filters.assigneeId || ''}
          onChange={(e) => update('assigneeId', e.target.value)}
          className={selectClass}
        >
          <option value="">All members</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      )}

      {(filters.status || filters.priority || filters.assigneeId) && (
        <button
          onClick={() => onChange({})}
          className="text-sm font-medium text-clay-dark underline decoration-dotted underline-offset-4 hover:text-clay"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
