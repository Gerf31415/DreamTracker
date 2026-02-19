import { NavLink } from 'react-router-dom';
import { useDreams } from '../context/DreamContext';

export default function Layout({ children }) {
  const { logs } = useDreams();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🌙</span>
            <span className="text-lg font-bold tracking-tight text-dream-200">DreamTracker</span>
          </div>
          <nav className="flex items-center gap-1">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-dream-700 text-white' : 'text-white/60 hover:text-white hover:bg-white/10'}`
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/logs"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-dream-700 text-white' : 'text-white/60 hover:text-white hover:bg-white/10'}`
              }
            >
              Logs {logs.length > 0 && <span className="ml-1 bg-dream-500/30 text-dream-300 text-xs px-1.5 py-0.5 rounded-full">{logs.length}</span>}
            </NavLink>
            <NavLink
              to="/upload"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-dream-700 text-white' : 'text-white/60 hover:text-white hover:bg-white/10'}`
              }
            >
              Upload
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        {children}
      </main>
      <footer className="border-t border-white/10 text-center text-white/30 text-xs py-3">
        DreamTracker — visualize your dream patterns
      </footer>
    </div>
  );
}
