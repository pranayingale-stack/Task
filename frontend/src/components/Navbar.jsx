import { useAuth } from '../context/AuthContext';

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="border-b border-ink/10 bg-ink text-sand">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-amber font-display text-sm font-bold text-ink">
            CT
          </div>
          <div>
            <p className="font-display text-sm font-semibold leading-tight">Committee Task Board</p>
            <p className="font-mono text-[11px] uppercase tracking-widest text-sand/50">
              {user?.role === 'tech_head' ? 'Tech Head Console' : 'Member Workspace'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium">{user?.name}</p>
            <p className="font-mono text-[11px] text-sand/50">@{user?.username}</p>
          </div>
          <button
            onClick={logout}
            className="rounded-md border border-sand/25 px-3 py-1.5 text-sm font-medium text-sand hover:bg-sand/10"
          >
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}
