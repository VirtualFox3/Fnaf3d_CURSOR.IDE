import { Link } from 'react-router-dom';

import { usePlaylistStore } from '../store/playlist';

export function PlaylistSidebar() {
  const playlists = usePlaylistStore((state) => state.playlists);

  return (
    <aside className="w-full space-y-4 lg:w-64">
      <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
        <h3 className="mb-3 text-sm font-semibold text-slate-200">Playlists</h3>
        {playlists.length === 0 ? (
          <p className="text-xs text-slate-400">No playlists yet</p>
        ) : (
          <ul className="space-y-2">
            {playlists.map((playlist) => (
              <li key={playlist.id}>
                <Link
                  to={`/playlist/${playlist.id}`}
                  className="block rounded-md px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
                >
                  {playlist.name}
                  <span className="ml-2 text-xs text-slate-500">({playlist.videos.length})</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
        <button
          type="button"
          className="mt-3 w-full rounded-md border border-dashed border-slate-700 px-3 py-2 text-sm font-medium text-slate-400 transition-colors hover:border-primary-500 hover:text-primary-400"
        >
          + New Playlist
        </button>
      </div>
    </aside>
  );
}
