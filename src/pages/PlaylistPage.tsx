import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Playlist, Video } from '../types';
import { storageService } from '../services/storageService';
import { LibraryItem } from '../components/library/LibraryItem';

export function PlaylistPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    loadPlaylist();
  }, [id]);

  const loadPlaylist = () => {
    if (!id) {
      navigate('/');
      return;
    }

    const foundPlaylist = storageService.getPlaylist(id);
    if (!foundPlaylist) {
      navigate('/');
      return;
    }

    setPlaylist(foundPlaylist);
    setEditName(foundPlaylist.name);

    // Load videos in playlist
    const allVideos = storageService.getVideos();
    const playlistVideos = allVideos.filter(video =>
      foundPlaylist.videoIds.includes(video.id)
    );
    setVideos(playlistVideos);
    setLoading(false);
  };

  const handleSaveEdit = () => {
    if (!playlist || !editName.trim()) return;
    
    storageService.updatePlaylist(playlist.id, { name: editName.trim() });
    setPlaylist({ ...playlist, name: editName.trim() });
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (!playlist) return;
    
    if (confirm(`Are you sure you want to delete the playlist "${playlist.name}"?`)) {
      storageService.deletePlaylist(playlist.id);
      navigate('/');
    }
  };

  const handleRemoveVideo = (videoId: string) => {
    if (!playlist) return;
    
    storageService.removeVideoFromPlaylist(playlist.id, videoId);
    loadPlaylist();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <svg
            className="animate-spin h-12 w-12 text-blue-500 mx-auto"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <p className="mt-4 text-gray-400">Loading playlist...</p>
        </div>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-300 mb-4">Playlist not found</h2>
        <Link to="/" className="text-blue-400 hover:text-blue-300">
          Back to Library
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link
        to="/"
        className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors"
      >
        <svg
          className="w-5 h-5 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
        Back to Library
      </Link>

      {/* Playlist header */}
      <div className="card p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {isEditing ? (
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                <button
                  onClick={handleSaveEdit}
                  className="btn-primary"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditName(playlist.name);
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div>
                <h1 className="text-3xl font-bold mb-2">{playlist.name}</h1>
                <p className="text-gray-400">
                  {videos.length} {videos.length === 1 ? 'video' : 'videos'}
                </p>
              </div>
            )}
          </div>

          {!isEditing && (
            <div className="flex items-center space-x-2 ml-4">
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                aria-label="Edit playlist name"
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
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>
              <button
                onClick={handleDelete}
                className="p-2 rounded hover:bg-red-900/50 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors text-red-400"
                aria-label="Delete playlist"
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
          )}
        </div>
      </div>

      {/* Playlist videos */}
      {videos.length === 0 ? (
        <div className="text-center py-12 card">
          <svg
            className="mx-auto h-12 w-12 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-300">No videos in playlist</h3>
          <p className="mt-2 text-sm text-gray-500">
            Add videos to this playlist from the library.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {videos.map((video) => (
            <div key={video.id} className="relative">
              <LibraryItem video={video} onUpdate={loadPlaylist} />
              <button
                onClick={() => handleRemoveVideo(video.id)}
                className="absolute top-2 right-2 p-2 bg-red-600 rounded-full hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 shadow-lg z-10"
                aria-label="Remove from playlist"
                title="Remove from playlist"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
