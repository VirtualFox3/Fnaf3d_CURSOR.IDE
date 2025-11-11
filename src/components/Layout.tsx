import { NavLink, Outlet } from 'react-router-dom';
import { useMemo } from 'react';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import NowPlayingBar from './NowPlayingBar';
import { usePlayerStore } from '../store/playerStore';

const Layout = () => {
  useKeyboardShortcuts();

  const lastPlayed = usePlayerStore((state) => state.lastPlayed);

  const lastPlayedLabel = useMemo(() => {
    if (!lastPlayed) return 'Nothing played yet';
    return `${lastPlayed.title}`;
  }, [lastPlayed]);

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header__brand">
          <NavLink to="/" className="brand-link">
            VidFlow
          </NavLink>
          <span className="app-header__tagline">Playlists that follow you everywhere.</span>
        </div>
        <nav className="app-nav">
          <NavLink to="/" className={({ isActive }) => (isActive ? 'nav-link nav-link--active' : 'nav-link')} end>
            Library
          </NavLink>
        </nav>
        <div className="app-header__meta" title={lastPlayed ? `${lastPlayed.title} • ${lastPlayed.channel}` : 'Nothing played yet'}>
          <span className="app-header__meta-label">Last played</span>
          <span className="app-header__meta-value">{lastPlayedLabel}</span>
        </div>
      </header>
      <main className="app-main">
        <div className="app-content">
          <Outlet />
        </div>
      </main>
      <NowPlayingBar />
    </div>
  );
};

export default Layout;
