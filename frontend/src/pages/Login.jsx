import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ApiClientError } from '../api/client';

export default function Login() {
  const { login, isAuthenticated, user } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to={user.role === 'tech_head' ? '/tech-head' : '/member'} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password) {
      setError('Please enter both username and password.');
      return;
    }
    setSubmitting(true);
    try {
      await login(username.trim(), password);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Unable to log in. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-sand px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-ink font-display text-lg font-bold text-amber">
            CT
          </div>
          <h1 className="font-display text-2xl font-semibold text-ink">Committee Task Board</h1>
          <p className="mt-1 text-sm text-ink/60">Sign in to view and manage committee work.</p>
        </div>

        <form onSubmit={handleSubmit} className="ticket-notch space-y-4 rounded-lg border border-ink/10 bg-white p-6 shadow-ticket">
          <div>
            <label htmlFor="username" className="mb-1 block text-xs font-mono uppercase tracking-wide text-ink/50">
              Username
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-sm focus:border-clay focus:outline-none"
              placeholder="techhead"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-xs font-mono uppercase tracking-wide text-ink/50">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-sm focus:border-clay focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p role="alert" className="rounded-md border border-clay/30 bg-clay/5 px-3 py-2 text-sm text-clay-dark">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md bg-ink px-4 py-2 text-sm font-medium text-sand hover:bg-ink-light disabled:opacity-60"
          >
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="mt-4 rounded-md border border-ink/10 bg-white/60 p-3 font-mono text-xs text-ink/60">
          <p className="mb-1 font-semibold text-ink/70">Demo credentials</p>
          <p>Tech Head — techhead / TechHead@123</p>
          <p>Member — member1 / Member1@123</p>
        </div>
      </div>
    </div>
  );
}
