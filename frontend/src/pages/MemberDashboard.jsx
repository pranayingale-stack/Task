import { useCallback, useEffect, useState } from 'react';
import { Navbar } from '../components/Navbar';
import { FilterBar } from '../components/FilterBar';
import { TaskCard } from '../components/TaskCard';
import { LoadingState, EmptyState, ErrorState } from '../components/StateViews';
import { useToast } from '../components/Toast';
import { api, ApiClientError } from '../api/client';

export default function MemberDashboard() {
  const toast = useToast();
  const [tasks, setTasks] = useState([]);
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const data = await api.get('/tasks', filters);
      setTasks(data.tasks);
    } catch (err) {
      setLoadError(err instanceof ApiClientError ? err.message : 'Could not load your tasks.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleStatusChange = async (task, status) => {
    const previous = tasks;
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status } : t)));
    try {
      await api.patch(`/tasks/${task.id}/status`, { status });
      toast('Status updated.');
    } catch (err) {
      setTasks(previous);
      toast.error(err instanceof ApiClientError ? err.message : 'Could not update status.');
    }
  };

  return (
    <div className="min-h-screen bg-sand">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div className="mb-5">
          <h1 className="font-display text-xl font-semibold text-ink">Your assigned tasks</h1>
          <p className="text-sm text-ink/60">Update the status as you make progress. Only you can see this list.</p>
        </div>

        <div className="mb-5">
          <FilterBar filters={filters} onChange={setFilters} />
        </div>

        {loading && <LoadingState />}
        {!loading && loadError && <ErrorState message={loadError} onRetry={loadTasks} />}
        {!loading && !loadError && tasks.length === 0 && (
          <EmptyState
            title="Nothing assigned to you yet"
            description="When the Tech Head assigns you a task, it will show up here."
          />
        )}

        {!loading && !loadError && tasks.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} onStatusChange={handleStatusChange} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
