import { useMemo } from 'react';
import { Link } from 'react-router-dom';

import { usePlayerStore } from '../store/player';
import { useQueueStore } from '../store/queue';

export function NowPlayingBar() {
  const current = usePlayerStore((state) => state.current);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const togglePlay = usePlayerStore((state) => state.togglePlay);
  const { items, currentIndex, playNext, playPrevious } = useQueueStore((state) => ({
    items: state.items,
    currentIndex: state.currentIndex,
    playNext: state.playNext,
    playPrevious: state.playPrevious,
  }));

  const queueCount = items.length;
  const currentVideo = useMemo(() => current ?? items[currentIndex] ?? undefined, [
    current,
    items,
    currentIndex,
  ]);

  if (!currentVideo) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-800 bg-slate-950/90 backdrop-blur">
      <div
        className="mx-auto flex w-full max-w-5xl items-center gap-3 px-4 py-3"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 0.5rem)' }}
      >
        <picture className="hidden h-14 w-14 overflow-hidden rounded-lg sm:block">
          <img
            src={currentVideo.thumbnailUrl ?? 'https://placehold.co/112x112?text=Noha'}
            alt={currentVideo.title}
            className="h-full w-full object-cover"
          />
        </picture>
        <div className="flex min-w-0 flex-1 flex-col">
          <Link to={`/watch/${currentVideo.id}`} className="truncate text-sm font-medium text-white">
            {currentVideo.title}
          </Link>
          {currentVideo.channelName ? (
            <span className="truncate text-xs text-slate-400">{currentVideo.channelName}</span>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={playPrevious}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 text-slate-200 hover:bg-slate-800"
            aria-label="Previous"
            disabled={currentIndex <= 0}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="h-5 w-5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 4.5L7.5 12l9 7.5" />
            </svg>
          </button>
          <button
            type="button"
            onClick={togglePlay}
            className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary-500 text-slate-950 hover:bg-primary-400"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                <path d="M15.75 5.25a.75.75 0 0 1 .75.75v12a.75.75 0 0 1-1.5 0v-12a.75.75 0 0 1 .75-.75Zm-6 0a.75.75 0 0 1 .75.75v12a.75.75 0 0 1-1.5 0v-12a.75.75 0 0 1 .75-.75Z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                <path d="M4.5 5.184c0-1.443 1.582-2.337 2.812-1.553l11.25 7.065a1.812 1.812 0 0 1 0 3.046l-11.25 7.065C6.082 21.592 4.5 20.698 4.5 19.255V5.184Z" />
              </svg>
            )}
          </button>
          <button
            type="button"
            onClick={playNext}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 text-slate-200 hover:bg-slate-800"
            aria-label="Next"
            disabled={currentIndex === -1 || currentIndex >= queueCount - 1}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="h-5 w-5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m7.5 19.5 9-7.5-9-7.5" />
            </svg>
          </button>
        </div>
        <Link
          to="/playlist/queue"
          className="hidden items-center gap-2 rounded-full border border-slate-700 px-3 py-2 text-xs font-medium text-slate-300 transition-colors hover:border-primary-500 hover:text-white sm:inline-flex"
        >
          Queue
          <span className="inline-flex h-5 min-w-[1.5rem] items-center justify-center rounded-full bg-slate-800 px-2 text-[0.65rem] font-semibold text-slate-200">
            {queueCount}
          </span>
        </Link>
      </div>
    </div>
  );
}
