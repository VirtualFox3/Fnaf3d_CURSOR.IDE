import { ChangeEvent, useMemo } from 'react';
import clsx from 'clsx';
import { useShallow } from 'zustand/react/shallow';
import { usePlayerStore } from '../store/playerStore';
import { formatTime } from '../utils/formatTime';

const RepeatLabel: Record<'off' | 'all' | 'one', string> = {
  off: 'Repeat off',
  all: 'Repeat all',
  one: 'Repeat one'
};

const NowPlayingBar = () => {
  const {
    currentVideo,
    isPlaying,
    currentTime,
    duration,
    volume,
    muted,
    shuffle,
    repeat,
    audioOnly,
    collapsedMiniPlayer,
    isFullscreen,
    togglePlay,
    next,
    previous,
    setVolume,
    setMuted,
    toggleShuffle,
    cycleRepeat,
    setAudioOnly,
    toggleCollapsedMiniPlayer,
    toggleFullscreen,
    seekTo
  } = usePlayerStore(
    useShallow((state) => ({
      currentVideo: state.queue[state.currentIndex] ?? null,
      isPlaying: state.isPlaying,
      currentTime: state.currentTime,
      duration: state.duration,
      volume: state.volume,
      muted: state.muted,
      shuffle: state.shuffle,
      repeat: state.repeat,
      audioOnly: state.audioOnly,
      collapsedMiniPlayer: state.collapsedMiniPlayer,
      isFullscreen: state.isFullscreen,
      togglePlay: state.togglePlay,
      next: state.next,
      previous: state.previous,
      setVolume: state.setVolume,
      setMuted: state.setMuted,
      toggleShuffle: state.toggleShuffle,
      cycleRepeat: state.cycleRepeat,
      setAudioOnly: state.setAudioOnly,
      toggleCollapsedMiniPlayer: state.toggleCollapsedMiniPlayer,
      toggleFullscreen: state.toggleFullscreen,
      seekTo: state.seekTo
    }))
  );

  const progress = useMemo(() => {
    if (!duration || duration === Infinity) return 0;
    return Math.min(100, Math.max(0, (currentTime / duration) * 100));
  }, [currentTime, duration]);

  const handleVolumeChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value);
    setVolume(value);
    if (value > 0 && muted) {
      setMuted(false);
    }
  };

  const handleScrub = (event: ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value);
    seekTo(value);
  };

  return (
    <div
      className={clsx('now-playing', {
        'now-playing--collapsed': collapsedMiniPlayer
      })}
    >
      <div className="now-playing__inner">
        <div className="now-playing__start">
          <button
            type="button"
            className="now-playing__collapse"
            onClick={toggleCollapsedMiniPlayer}
            aria-label={collapsedMiniPlayer ? 'Expand mini-player' : 'Collapse mini-player'}
          >
            {collapsedMiniPlayer ? '▴' : '▾'}
          </button>
          {currentVideo ? (
            <>
              <img src={currentVideo.thumbnail} alt="Current video thumbnail" className="now-playing__thumb" />
              <div className="now-playing__meta">
                <span className="now-playing__title" title={currentVideo.title}>
                  {currentVideo.title}
                </span>
                <span className="now-playing__channel">{currentVideo.channel}</span>
              </div>
            </>
          ) : (
            <span className="now-playing__empty">Queue is empty. Explore a playlist to start listening.</span>
          )}
        </div>

        {currentVideo && (
          <div className="now-playing__center">
            <div className="controls">
              <button
                type="button"
                className={clsx('control-button', { 'control-button--active': shuffle })}
                onClick={toggleShuffle}
                aria-pressed={shuffle}
                aria-label={shuffle ? 'Disable shuffle' : 'Enable shuffle'}
              >
                🔀
              </button>
              <button type="button" className="control-button" onClick={previous} aria-label="Previous video">
                ⏮
              </button>
              <button
                type="button"
                className={clsx('control-button', 'control-button--primary')}
                onClick={togglePlay}
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? '⏸' : '▶️'}
              </button>
              <button type="button" className="control-button" onClick={() => next()} aria-label="Next video">
                ⏭
              </button>
              <button
                type="button"
                className={clsx('control-button', { 'control-button--active': repeat !== 'off' })}
                onClick={cycleRepeat}
                aria-label={RepeatLabel[repeat]}
              >
                {repeat === 'one' ? '🔂' : '🔁'}
              </button>
            </div>
            <div className="progress">
              <span className="progress__time">{formatTime(currentTime)}</span>
              <input
                type="range"
                min={0}
                max={Number.isFinite(duration) && duration > 0 ? duration : 1}
                step={1}
                value={Number.isFinite(duration) && duration > 0 ? Math.min(currentTime, duration) : 0}
                onChange={handleScrub}
                className="progress__slider"
                aria-label="Seek"
              />
              <span className="progress__time">{formatTime(duration)}</span>
            </div>
          </div>
        )}

        {currentVideo && (
          <div className="now-playing__end">
            <div className="volume">
              <button
                type="button"
                className={clsx('control-button', { 'control-button--active': muted })}
                onClick={() => setMuted(!muted)}
                aria-label={muted ? 'Unmute' : 'Mute'}
              >
                {muted ? '🔇' : '🔊'}
              </button>
              <input
                type="range"
                min={0}
                max={100}
                value={volume}
                onChange={handleVolumeChange}
                className="volume__slider"
                aria-label="Volume"
              />
            </div>
            <button
              type="button"
              className={clsx('control-button', { 'control-button--active': audioOnly })}
              onClick={() => setAudioOnly(!audioOnly)}
              aria-label={audioOnly ? 'Disable audio-only mode' : 'Enable audio-only mode'}
            >
              🎧
            </button>
            <button
              type="button"
              className={clsx('control-button', { 'control-button--active': isFullscreen })}
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              ⛶
            </button>
          </div>
        )}
      </div>
      {currentVideo && !collapsedMiniPlayer && (
        <div className="now-playing__progress-bar" aria-hidden>
          <div className="now-playing__progress-fill" style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  );
};

export default NowPlayingBar;
