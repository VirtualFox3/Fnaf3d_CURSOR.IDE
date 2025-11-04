import { Link, NavLink } from 'react-router-dom';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
    isActive ? 'bg-slate-800 text-white' : 'text-slate-300 hover:text-white'
  }`;

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
        <Link
          to="/"
          className="flex items-center gap-2 text-lg font-semibold tracking-tight text-white"
        >
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary-500 text-slate-950">
            ن
          </span>
          <span>Noha Player</span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          <NavLink to="/" className={navLinkClass} end>
            Library
          </NavLink>
          <NavLink to="/watch/demo" className={navLinkClass}>
            Watch
          </NavLink>
          <NavLink to="/playlist/sample" className={navLinkClass}>
            Playlist
          </NavLink>
        </nav>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="hidden rounded-md border border-slate-700 px-3 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 md:inline-flex"
          >
            Sign in
          </button>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-700 text-slate-200 transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 md:hidden"
            aria-label="Open navigation"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="h-5 w-5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 5.25h16.5M3.75 12h16.5m-16.5 6.75h16.5" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
