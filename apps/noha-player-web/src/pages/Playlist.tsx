import { Link, useParams } from 'react-router-dom';

import { usePlaylistStore } from '../store/playlist';
import { PlaylistSidebar } from '../components/PlaylistSidebar';

export function Playlist() {
  const { id } = useParams();
  const getPlaylistById = usePlaylistStore((state) => state.getPlaylistById);

  const playlist = id ? getPlaylistById(id) : undefined;

  if (!playlist) {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 pb-32 pt-6">
        <h1 className="text-3xl font-bold text-slate-100">Playlist Not Found</h1>
        <p className="text-slate-400">
          The playlist you're looking for doesn't exist or has been deleted.
        </p>
        <Link to="/" className="text-primary-400 underline">
          Return to Library
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pb-32 pt-6 lg:flex-row">
      <main className="flex-1 space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-100">{playlist.name}</h1>
          <p className="text-sm text-slate-400">
            Created {new Date(playlist.createdAt).toLocaleDateString()}
            {' • '}
            {playlist.videos.length} {playlist.videos.length === 1 ? 'video' : 'videos'}
          </p>
        </div>

        {playlist.videos.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-700 p-8 text-center text-slate-400">
            <p>This playlist is empty.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {playlist.videos.map((video) => (
              <Link
                key={video.id}
                to={`/watch/${video.id}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 shadow-lg shadow-slate-950/40 transition-transform hover:-translate-y-0.5 hover:border-primary-500"
              >
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={video.thumbnailUrl ?? 'https://placehold.co/320x180?text=Noha'}
                    alt={video.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                </div>
                <div className="flex flex-1 flex-col gap-2 p-4">
                  <h3 className="text-base font-semibold text-slate-100">{video.title}</h3>
                  {video.channelName ? (
                    <p className="text-sm text-slate-400">{video.channelName}</p>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <PlaylistSidebar />
    </div>
  );
}
