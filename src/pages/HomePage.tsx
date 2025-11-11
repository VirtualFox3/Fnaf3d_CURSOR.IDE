import { Link, useNavigate } from 'react-router-dom';
import { useLibraryStore } from '../store/libraryStore';
import { usePlayerStore } from '../store/playerStore';
import { formatTime } from '../utils/formatTime';

const HomePage = () => {
  const navigate = useNavigate();
  const playlists = useLibraryStore((state) => state.playlists);
  const setQueue = usePlayerStore((state) => state.setQueue);
  const history = usePlayerStore((state) => state.history);
  const recentHistory = history.slice(0, 6);

  const startVideo = (videoId: string) => {
    const playlist = playlists.find((pl) => pl.videos.some((video) => video.id === videoId));
    if (playlist) {
      const startIndex = playlist.videos.findIndex((video) => video.id === videoId);
      setQueue(playlist.videos, startIndex);
      navigate(`/watch/${videoId}?playlist=${playlist.id}`);
    } else {
      const historyEntry = history.find((entry) => entry.video.id === videoId);
      if (historyEntry) {
        setQueue([historyEntry.video], 0);
      }
      navigate(`/watch/${videoId}`);
    }
  };

  const handlePlayPlaylist = (playlistId: string) => {
    const playlist = playlists.find((item) => item.id === playlistId);
    if (!playlist || playlist.videos.length === 0) return;
    setQueue(playlist.videos, 0);
    navigate(`/watch/${playlist.videos[0].id}?playlist=${playlist.id}`);
  };

  const handleResume = () => {
    const last = history[0];
    if (!last) return;
    startVideo(last.video.id);
  };

  return (
    <div className="page page--home">
      <section className="panel panel--hero">
        <div className="panel__content">
          <h1 className="panel__title">Welcome back 👋</h1>
          <p className="panel__subtitle">Pick up where you left off or dive into a curated playlist.</p>
          <div className="panel__actions">
            <button type="button" className="btn" onClick={handleResume} disabled={history.length === 0}>
              Resume last video
            </button>
            <Link to="/playlist/focus-vibes" className="btn btn--ghost">
              Open Focus Vibes
            </Link>
          </div>
        </div>
      </section>

      <section className="panel">
        <header className="panel__header">
          <h2 className="panel__title">Playlists</h2>
          <p className="panel__subtitle">Your collections are synced locally so everything stays just how you left it.</p>
        </header>
        <div className="playlist-grid">
          {playlists.map((playlist) => (
            <article key={playlist.id} className="playlist-card">
              <div className="playlist-card__thumb">
                <img src={playlist.coverImage ?? playlist.videos[0]?.thumbnail} alt="Playlist cover" />
                <span className="playlist-card__count">{playlist.videos.length} videos</span>
              </div>
              <div className="playlist-card__body">
                <h3 className="playlist-card__title">{playlist.title}</h3>
                <p className="playlist-card__description">{playlist.description}</p>
                <div className="playlist-card__meta">Last updated {new Date(playlist.updatedAt).toLocaleDateString()}</div>
                <div className="playlist-card__actions">
                  <button type="button" className="btn btn--small" onClick={() => handlePlayPlaylist(playlist.id)}>
                    Play
                  </button>
                  <Link to={`/playlist/${playlist.id}`} className="btn btn--small btn--ghost">
                    View
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <header className="panel__header">
          <h2 className="panel__title">Recently played</h2>
        </header>
        {recentHistory.length === 0 ? (
          <div className="panel__empty">Your listening history will appear here once you start playing.</div>
        ) : (
          <ul className="history-list">
            {recentHistory.map((entry) => (
              <li key={`${entry.video.id}-${entry.playedAt}`} className="history-list__item">
                <button type="button" className="history-list__button" onClick={() => startVideo(entry.video.id)}>
                  <img src={entry.video.thumbnail} alt="" className="history-list__thumb" />
                  <div className="history-list__meta">
                    <span className="history-list__title">{entry.video.title}</span>
                    <span className="history-list__channel">{entry.video.channel}</span>
                  </div>
                  <span className="history-list__duration">{formatTime(entry.video.duration)}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default HomePage;
