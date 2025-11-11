import { useEffect, useMemo } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useShallow } from 'zustand/react/shallow';
import VideoPlayer from '../components/VideoPlayer';
import Queue from '../components/Queue';
import { useLibraryStore } from '../store/libraryStore';
import { usePlayerStore } from '../store/playerStore';
import type { VideoItem } from '../data/playlists';

const queuesMatch = (a: VideoItem[], b: VideoItem[]) => {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (a[i].id !== b[i].id) return false;
  }
  return true;
};

const WatchPage = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const [searchParams] = useSearchParams();
  const playlists = useLibraryStore((state) => state.playlists);
  const getPlaylist = useLibraryStore((state) => state.getPlaylist);

  const {
    queue,
    currentIndex,
    setQueue,
    setCurrentIndex
  } = usePlayerStore(
    useShallow((state) => ({
      queue: state.queue,
      currentIndex: state.currentIndex,
      setQueue: state.setQueue,
      setCurrentIndex: state.setCurrentIndex
    }))
  );

  const playlistId = searchParams.get('playlist');
  const playlist = playlistId ? getPlaylist(playlistId) : undefined;
  const currentVideo = queue[currentIndex] ?? null;

  const fallbackVideo = useMemo(() => {
    if (!videoId) return null;
    for (const pl of playlists) {
      const match = pl.videos.find((video) => video.id === videoId);
      if (match) return match;
    }
    return null;
  }, [playlists, videoId]);

  useEffect(() => {
    if (!videoId) return;

    const indexInQueue = queue.findIndex((video) => video.id === videoId);
    if (indexInQueue >= 0) {
      if (indexInQueue !== currentIndex) {
        setCurrentIndex(indexInQueue);
      }
      return;
    }

    let candidateQueue: VideoItem[] | null = null;
    if (playlist && playlist.videos.length > 0) {
      candidateQueue = playlist.videos;
    } else if (fallbackVideo) {
      candidateQueue = [fallbackVideo];
    }

    if (candidateQueue) {
      const startIndex = candidateQueue.findIndex((video) => video.id === videoId);
      if (!queuesMatch(candidateQueue, queue)) {
        setQueue(candidateQueue, startIndex >= 0 ? startIndex : 0);
      } else if (startIndex >= 0) {
        setCurrentIndex(startIndex);
      }
    }
  }, [videoId, queue, currentIndex, setQueue, setCurrentIndex, playlist, fallbackVideo]);

  const fromPlaylist = useMemo(() => {
    if (!playlistId) return null;
    return playlist ?? null;
  }, [playlist, playlistId]);

  return (
    <div className="page page--watch">
      <div className="watch-layout">
        <section className="watch-player">
          <VideoPlayer />
          {currentVideo ? (
            <article className="watch-details">
              <header>
                <h1 className="watch-details__title">{currentVideo.title}</h1>
                <p className="watch-details__channel">{currentVideo.channel}</p>
              </header>
              {fromPlaylist && (
                <p className="watch-details__playlist">
                  From playlist <Link to={`/playlist/${fromPlaylist.id}`}>{fromPlaylist.title}</Link>
                </p>
              )}
            </article>
          ) : (
            <div className="watch-placeholder">Select a video from the library to begin watching.</div>
          )}
        </section>
        <Queue />
      </div>
    </div>
  );
};

export default WatchPage;
