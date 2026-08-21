import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { api, setAuthToken, setUnauthorizedHandler, ApiClientError } from '../api/client';

const AuthContext = createContext(null);
const STORAGE_KEY = 'committee_task_manager_session';

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null); // { token, user }
  const [initializing, setInitializing] = useState(true);

  // Restore session on load.
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setSession(parsed);
        setAuthToken(parsed.token);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setInitializing(false);
  }, []);

  const logout = useCallback(() => {
    setSession(null);
    setAuthToken(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // If any API call comes back 401 (expired/invalid token), drop the session.
  useEffect(() => {
    setUnauthorizedHandler(() => logout());
  }, [logout]);

  const login = useCallback(async (username, password) => {
    const data = await api.post('/auth/login', { username, password });
    const next = { token: data.token, user: data.user };
    setSession(next);
    setAuthToken(data.token);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return next;
  }, []);

  const value = useMemo(
    () => ({
      user: session?.user || null,
      isAuthenticated: !!session,
      initializing,
      login,
      logout,
    }),
    [session, initializing, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

export { ApiClientError };
