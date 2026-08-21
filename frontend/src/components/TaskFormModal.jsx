import { useEffect, useState } from 'react';

const STATUSES = ['Pending', 'In Progress', 'Completed'];
const PRIORITIES = ['Low', 'Medium', 'High'];

const EMPTY_FORM = {
  title: '',
  description: '',
  assigneeId: '',
  status: 'Pending',
  priority: 'Medium',
  deadline: '',
};

export function TaskFormModal({ open, task, members, onSubmit, onClose, submitting }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!open) return;
    if (task) {
      setForm({
        title: task.title || '',
        description: task.description || '',
        assigneeId: String(task.assignee_id || ''),
        status: task.status || 'Pending',
        priority: task.priority || 'Medium',
        deadline: task.deadline ? task.deadline.slice(0, 10) : '',
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
  }, [open, task]);

  if (!open) return null;

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required.';
    else if (form.title.length > 150) errs.title = 'Title must be 150 characters or fewer.';
    if (!form.assigneeId) errs.assigneeId = 'Please select an assignee.';
    if (form.deadline && Number.isNaN(new Date(form.deadline).getTime())) errs.deadline = 'Invalid date.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      title: form.title.trim(),
      description: form.description,
      assigneeId: Number(form.assigneeId),
      status: form.status,
      priority: form.priority,
      deadline: form.deadline || null,
    });
  };

  const inputClass = (key) =>
    `w-full rounded-md border bg-white px-3 py-2 text-sm text-ink focus:outline-none focus:border-clay ${
      errors[key] ? 'border-clay' : 'border-ink/20'
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4 py-6 backdrop-blur-sm">
      <div className="max-h-full w-full max-w-lg overflow-y-auto rounded-lg border border-ink/10 bg-sand-light p-5 shadow-ticket">
        <h3 className="font-display text-lg font-semibold text-ink">{task ? 'Edit task' : 'Create task'}</h3>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="mb-1 block text-xs font-mono uppercase tracking-wide text-ink/50">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => update('title', e.target.value)}
              className={inputClass('title')}
              maxLength={150}
              placeholder="e.g. Design event poster"
            />
            {errors.title && <p className="mt-1 text-xs text-clay-dark">{errors.title}</p>}
          </div>

          <div>
            <label className="mb-1 block text-xs font-mono uppercase tracking-wide text-ink/50">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              rows={3}
              maxLength={2000}
              className={inputClass('description')}
              placeholder="Any relevant detail for the assignee..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-mono uppercase tracking-wide text-ink/50">Assignee</label>
              <select
                value={form.assigneeId}
                onChange={(e) => update('assigneeId', e.target.value)}
                className={inputClass('assigneeId')}
              >
                <option value="">Select member</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
              {errors.assigneeId && <p className="mt-1 text-xs text-clay-dark">{errors.assigneeId}</p>}
            </div>

            <div>
              <label className="mb-1 block text-xs font-mono uppercase tracking-wide text-ink/50">Deadline</label>
              <input
                type="date"
                value={form.deadline}
                onChange={(e) => update('deadline', e.target.value)}
                className={inputClass('deadline')}
              />
              {errors.deadline && <p className="mt-1 text-xs text-clay-dark">{errors.deadline}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-mono uppercase tracking-wide text-ink/50">Status</label>
              <select value={form.status} onChange={(e) => update('status', e.target.value)} className={inputClass('status')}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-mono uppercase tracking-wide text-ink/50">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => update('priority', e.target.value)}
                className={inputClass('priority')}
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-ink/20 px-3 py-1.5 text-sm font-medium text-ink hover:bg-ink/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-ink px-4 py-1.5 text-sm font-medium text-sand hover:bg-ink-light disabled:opacity-60"
            >
              {submitting ? 'Saving…' : task ? 'Save changes' : 'Create task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
