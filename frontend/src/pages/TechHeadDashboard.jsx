import { useCallback, useEffect, useState } from 'react';
import { Navbar } from '../components/Navbar';
import { FilterBar } from '../components/FilterBar';
import { TaskCard } from '../components/TaskCard';
import { TaskFormModal } from '../components/TaskFormModal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { LoadingState, EmptyState, ErrorState } from '../components/StateViews';
import { useToast } from '../components/Toast';
import { api, ApiClientError } from '../api/client';

export default function TechHeadDashboard() {
  const toast = useToast();
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadMembers = useCallback(async () => {
    const data = await api.get('/users/members');
    setMembers(data.members);
  }, []);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const data = await api.get('/tasks', filters);
      setTasks(data.tasks);
    } catch (err) {
      setLoadError(err instanceof ApiClientError ? err.message : 'Could not load tasks.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadMembers().catch(() => toast.error('Could not load committee members.'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const openCreate = () => {
    setEditingTask(null);
    setFormOpen(true);
  };

  const openEdit = (task) => {
    setEditingTask(task);
    setFormOpen(true);
  };

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    try {
      if (editingTask) {
        await api.put(`/tasks/${editingTask.id}`, payload);
        toast('Task updated.');
      } else {
        await api.post('/tasks', payload);
        toast('Task created.');
      }
      setFormOpen(false);
      loadTasks();
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : 'Could not save task.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.del(`/tasks/${deleteTarget.id}`);
      toast('Task deleted.');
      setDeleteTarget(null);
      loadTasks();
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : 'Could not delete task.');
    } finally {
      setDeleting(false);
    }
  };

  const handleStatusChange = async (task, status) => {
    const previous = tasks;
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status } : t)));
    try {
      await api.patch(`/tasks/${task.id}/status`, { status });
    } catch (err) {
      setTasks(previous);
      toast.error(err instanceof ApiClientError ? err.message : 'Could not update status.');
    }
  };

  return (
    <div className="min-h-screen bg-sand">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-xl font-semibold text-ink">All committee tasks</h1>
            <p className="text-sm text-ink/60">Create, assign, and track work across every member.</p>
          </div>
          <button
            onClick={openCreate}
            className="rounded-md bg-clay px-4 py-2 text-sm font-medium text-white hover:bg-clay-dark"
          >
            + New task
          </button>
        </div>

        <div className="mb-5">
          <FilterBar filters={filters} onChange={setFilters} members={members} />
        </div>

        {loading && <LoadingState />}
        {!loading && loadError && <ErrorState message={loadError} onRetry={loadTasks} />}
        {!loading && !loadError && tasks.length === 0 && (
          <EmptyState
            title="No tasks match these filters"
            description="Try clearing filters, or create the first task for your committee."
            action={
              <button onClick={openCreate} className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-sand hover:bg-ink-light">
                Create a task
              </button>
            }
          />
        )}

        {!loading && !loadError && tasks.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                canManage
                onEdit={openEdit}
                onDelete={setDeleteTarget}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}
      </main>

      <TaskFormModal
        open={formOpen}
        task={editingTask}
        members={members}
        submitting={submitting}
        onSubmit={handleSubmit}
        onClose={() => setFormOpen(false)}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this task?"
        description={deleteTarget ? `"${deleteTarget.title}" will be permanently removed for ${deleteTarget.assignee_name}.` : ''}
        confirmLabel={deleting ? 'Deleting…' : 'Delete'}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
