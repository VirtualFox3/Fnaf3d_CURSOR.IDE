import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useLibraryStore } from '../store/libraryStore';
import { usePlayerStore } from '../store/playerStore';
import { formatTime } from '../utils/formatTime';

const PlaylistPage = () => {
  const { playlistId } = useParams<{ playlistId: string }>();
  const navigate = useNavigate();
  const playlist = useLibraryStore((state) => (playlistId ? state.getPlaylist(playlistId) : undefined));
  const updatePlaylistMetadata = useLibraryStore((state) => state.updatePlaylistMetadata);
  const setQueue = usePlayerStore((state) => state.setQueue);

  const [title, setTitle] = useState(playlist?.title ?? '');
  const [description, setDescription] = useState(playlist?.description ?? '');

  useEffect(() => {
    if (playlist) {
      setTitle(playlist.title);
      setDescription(playlist.description);
    }
  }, [playlist]);

  const totalDuration = useMemo(() => {
    if (!playlist) return 0;
    return playlist.videos.reduce((sum, video) => sum + (video.duration ?? 0), 0);
  }, [playlist]);

  if (!playlistId || !playlist) {
    return (
      <div className="page page--playlist">
        <section className="panel">
          <h1 className="panel__title">Playlist not found</h1>
          <Link to="/" className="btn">
            Back to library
          </Link>
        </section>
      </div>
    );
  }

  const handlePlayAll = () => {
    if (!playlist.videos.length) return;
    setQueue(playlist.videos, 0);
    navigate(`/watch/${playlist.videos[0].id}?playlist=${playlist.id}`);
  };

  const handlePlayFrom = (videoId: string) => {
    const index = playlist.videos.findIndex((video) => video.id === videoId);
    setQueue(playlist.videos, index >= 0 ? index : 0);
    navigate(`/watch/${videoId}?playlist=${playlist.id}`);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    updatePlaylistMetadata(playlist.id, {
      title: title.trim() || playlist.title,
      description: description.trim()
    });
  };

  return (
    <div className="page page--playlist">
      <section className="panel panel--playlist">
        <div className="panel__cover">
          <img src={playlist.coverImage ?? playlist.videos[0]?.thumbnail} alt="Playlist cover" />
        </div>
        <form className="panel__form" onSubmit={handleSubmit}>
          <label className="form-field">
            <span className="form-field__label">Title</span>
            <input value={title} onChange={(event) => setTitle(event.target.value)} className="form-field__input" />
          </label>
          <label className="form-field">
            <span className="form-field__label">Description</span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
              className="form-field__input form-field__input--multiline"
            />
          </label>
          <div className="panel__actions">
            <button type="submit" className="btn btn--small">
              Save changes
            </button>
            <button type="button" className="btn btn--small btn--ghost" onClick={handlePlayAll} disabled={!playlist.videos.length}>
              Play all
            </button>
          </div>
          <dl className="panel__stats">
            <div>
              <dt>Videos</dt>
              <dd>{playlist.videos.length}</dd>
            </div>
            <div>
              <dt>Total duration</dt>
              <dd>{formatTime(totalDuration)}</dd>
            </div>
            <div>
              <dt>Updated</dt>
              <dd>{new Date(playlist.updatedAt).toLocaleDateString()}</dd>
            </div>
          </dl>
        </form>
      </section>

      <section className="panel">
        <header className="panel__header">
          <h2 className="panel__title">Contents</h2>
        </header>
        {playlist.videos.length === 0 ? (
          <div className="panel__empty">This playlist is empty. Add videos from the library to get started.</div>
        ) : (
          <ul className="playlist-table">
            {playlist.videos.map((video, index) => (
              <li key={video.id} className="playlist-table__row">
                <button
                  type="button"
                  className="playlist-table__play"
                  onClick={() => handlePlayFrom(video.id)}
                  aria-label={`Play ${video.title}`}
                >
                  ▶
                </button>
                <img src={video.thumbnail} alt="" className="playlist-table__thumb" />
                <div className="playlist-table__meta">
                  <span className="playlist-table__title">{video.title}</span>
                  <span className="playlist-table__channel">{video.channel}</span>
                </div>
                <span className="playlist-table__duration">{formatTime(video.duration)}</span>
                <span className="playlist-table__index">#{index + 1}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default PlaylistPage;
