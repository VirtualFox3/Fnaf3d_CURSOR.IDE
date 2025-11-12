import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Playlist } from '../../types';
import { storageService } from '../../services/storageService';

interface PlaylistSidebarProps {
  isOpen: boolean;
}

export function PlaylistSidebar({ isOpen }: PlaylistSidebarProps) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  useEffect(() => {
    loadPlaylists();
  }, []);

  const loadPlaylists = () => {
    setPlaylists(storageService.getPlaylists());
  };

  const handleCreatePlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;

    const playlist: Playlist = {
      id: Date.now().toString(),
      name: newPlaylistName.trim(),
      videoIds: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    storageService.addPlaylist(playlist);
    setNewPlaylistName('');
    setShowCreateForm(false);
    loadPlaylists();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => {}}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-16 left-0 bottom-0 w-64 bg-gray-800 border-r border-gray-700 transform transition-transform duration-300 z-30 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Playlists header */}
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Playlists</h2>
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="p-1 rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                aria-label="Create playlist"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </button>
            </div>

            {/* Create playlist form */}
            {showCreateForm && (
              <form onSubmit={handleCreatePlaylist} className="space-y-2">
                <input
                  type="text"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder="Playlist name"
                  className="w-full px-3 py-2 text-sm bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    className="flex-1 px-3 py-1 text-sm bg-blue-600 rounded hover:bg-blue-700 transition-colors"
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      setNewPlaylistName('');
                    }}
                    className="flex-1 px-3 py-1 text-sm bg-gray-700 rounded hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Playlists list */}
          <nav className="flex-1 overflow-y-auto p-4">
            {playlists.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                No playlists yet
              </p>
            ) : (
              <ul className="space-y-1">
                {playlists.map((playlist) => (
                  <li key={playlist.id}>
                    <Link
                      to={`/playlist/${playlist.id}`}
                      className="block px-3 py-2 rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm truncate">{playlist.name}</span>
                        <span className="text-xs text-gray-500 group-hover:text-gray-400">
                          {playlist.videoIds.length}
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </nav>
        </div>
      </aside>
    </>
  );
}
