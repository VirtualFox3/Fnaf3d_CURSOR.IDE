import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Video, Playlist } from '../../types';
import { storageService } from '../../services/storageService';

interface LibraryItemProps {
  video: Video;
  onUpdate: () => void;
}

export function LibraryItem({ video, onUpdate }: LibraryItemProps) {
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  const handleToggleFavorite = () => {
    storageService.updateVideo(video.id, { isFavorite: !video.isFavorite });
    onUpdate();
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to remove this video from your library?')) {
      storageService.deleteVideo(video.id);
      onUpdate();
    }
  };

  const handleShowPlaylistMenu = () => {
    setPlaylists(storageService.getPlaylists());
    setShowPlaylistMenu(true);
  };

  const handleAddToPlaylist = (playlistId: string) => {
    storageService.addVideoToPlaylist(playlistId, video.id);
    setShowPlaylistMenu(false);
  };

  return (
    <div className="card overflow-hidden group hover:shadow-xl transition-shadow">
      {/* Thumbnail */}
      <Link to={`/watch/${video.id}`} className="block aspect-video bg-gray-700 relative overflow-hidden">
        {video.thumbnail ? (
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg
              className="w-16 h-16 text-gray-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm12.553 1.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
            </svg>
          </div>
        )}
        
        {/* Duration badge */}
        {video.duration && (
          <span className="absolute bottom-2 right-2 px-2 py-1 bg-black bg-opacity-80 text-xs rounded">
            {video.duration}
          </span>
        )}
      </Link>

      {/* Content */}
      <div className="p-4">
        <Link
          to={`/watch/${video.id}`}
          className="block group-hover:text-blue-400 transition-colors"
        >
          <h3 className="font-semibold line-clamp-2 mb-1">{video.title}</h3>
        </Link>
        
        {video.channel && (
          <p className="text-sm text-gray-400 mb-3">{video.channel}</p>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between space-x-2">
          <div className="flex items-center space-x-2">
            {/* Favorite */}
            <button
              onClick={handleToggleFavorite}
              className="p-2 rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              aria-label={video.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              title={video.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <svg
                className={`w-5 h-5 ${video.isFavorite ? 'fill-yellow-500' : 'fill-none'}`}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
            </button>

            {/* Add to playlist */}
            <div className="relative">
              <button
                onClick={handleShowPlaylistMenu}
                className="p-2 rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                aria-label="Add to playlist"
                title="Add to playlist"
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

              {/* Playlist menu */}
              {showPlaylistMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowPlaylistMenu(false)}
                  />
                  <div className="absolute left-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-20">
                    <div className="p-2">
                      {playlists.length === 0 ? (
                        <p className="text-sm text-gray-500 p-2">No playlists</p>
                      ) : (
                        <ul className="space-y-1">
                          {playlists.map((playlist) => (
                            <li key={playlist.id}>
                              <button
                                onClick={() => handleAddToPlaylist(playlist.id)}
                                className="w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-700 transition-colors"
                              >
                                {playlist.name}
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Delete */}
          <button
            onClick={handleDelete}
            className="p-2 rounded hover:bg-red-900/50 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors text-red-400"
            aria-label="Delete video"
            title="Delete video"
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
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
