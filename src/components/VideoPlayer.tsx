import { useEffect, useMemo, useRef } from 'react';
import clsx from 'clsx';
import { useShallow } from 'zustand/react/shallow';
import { useYouTubeIframeAPI } from '../hooks/useYouTubeIframeAPI';
import { usePlayerStore } from '../store/playerStore';

const PLAYER_VARS: YT.PlayerVars = {
  autoplay: 1,
  controls: 0,
  disablekb: 1,
  fs: 0,
  modestbranding: 1,
  rel: 0,
  playsinline: 1
};

const VideoPlayer = () => {
  const ready = useYouTubeIframeAPI();
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YT.Player | null>(null);
  const frameRef = useRef<number>();
  const playerId = useMemo(() => `yt-player-${Math.random().toString(36).slice(2, 9)}`, []);

  const {
    currentVideo,
    isPlaying,
    volume,
    muted,
    audioOnly,
    isFullscreen,
    setPlayer,
    setReady,
    setDuration,
    setCurrentTime,
    syncIsPlaying,
    next,
    setFullscreen
  } = usePlayerStore(
    useShallow((state) => ({
      currentVideo: state.queue[state.currentIndex] ?? null,
      isPlaying: state.isPlaying,
      volume: state.volume,
      muted: state.muted,
      audioOnly: state.audioOnly,
      isFullscreen: state.isFullscreen,
      setPlayer: state.setPlayer,
      setReady: state.setReady,
      setDuration: state.setDuration,
      setCurrentTime: state.setCurrentTime,
      syncIsPlaying: state.syncIsPlaying,
      next: state.next,
      setFullscreen: state.setFullscreen
    }))
  );

  // Instantiate the player once the API is available
  useEffect(() => {
    if (!ready || !containerRef.current || playerRef.current || !window.YT) {
      return;
    }

    const placeholder = document.createElement('div');
    placeholder.id = playerId;
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(placeholder);

    const player = new window.YT.Player(playerId, {
      height: '100%',
      width: '100%',
      videoId: currentVideo?.id,
      playerVars: PLAYER_VARS,
      events: {
        onReady: (event) => {
          setPlayer(event.target);
          setReady(true);
          event.target.setVolume(volume);
          if (muted) {
            event.target.mute();
          }
          if (!currentVideo) {
            event.target.stopVideo();
          } else if (!isPlaying) {
            event.target.pauseVideo();
          }
          const duration = event.target.getDuration?.();
          if (typeof duration === 'number' && duration > 0) {
            setDuration(duration);
          }
        },
        onStateChange: (event) => {
          const playerState = event.data;
          if (playerState === window.YT.PlayerState.ENDED) {
            next(true);
          } else if (playerState === window.YT.PlayerState.PLAYING) {
            syncIsPlaying(true);
            const duration = event.target.getDuration?.();
            if (typeof duration === 'number' && duration > 0) {
              setDuration(duration);
            }
          } else if (playerState === window.YT.PlayerState.PAUSED) {
            syncIsPlaying(false);
          }
        }
      }
    });

    playerRef.current = player;

    return () => {
      frameRef.current && cancelAnimationFrame(frameRef.current);
      player.destroy();
      playerRef.current = null;
      setPlayer(null);
      setReady(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  // Load new videos when the queue selection changes
  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    if (!currentVideo) {
      player.stopVideo?.();
      setDuration(0);
      setCurrentTime(0);
      return;
    }

    const currentId = player.getVideoData()?.video_id;
    if (currentId !== currentVideo.id) {
      player.loadVideoById(currentVideo.id);
    }

    if (isPlaying) {
      player.playVideo();
    } else {
      player.pauseVideo();
    }
  }, [currentVideo?.id, currentVideo, isPlaying, setCurrentTime, setDuration]);

  // Apply volume changes
  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    player.setVolume?.(volume);
  }, [volume]);

  // Apply mute/unmute
  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    if (muted) {
      player.mute?.();
    } else {
      player.unMute?.();
    }
  }, [muted]);

  // Track progress while playing
  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    const tick = () => {
      const time = player.getCurrentTime?.();
      if (typeof time === 'number' && !Number.isNaN(time)) {
        setCurrentTime(time);
      }
      const duration = player.getDuration?.();
      if (typeof duration === 'number' && duration > 0) {
        setDuration(duration);
      }
      frameRef.current = requestAnimationFrame(tick);
    };

    if (isPlaying) {
      frameRef.current = requestAnimationFrame(tick);
    }

    return () => {
      frameRef.current && cancelAnimationFrame(frameRef.current);
    };
  }, [isPlaying, setCurrentTime, setDuration]);

  // Manage fullscreen toggling
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleChange = () => {
      const fsActive = document.fullscreenElement === container;
      if (fsActive !== isFullscreen) {
        setFullscreen(fsActive);
      }
    };

    document.addEventListener('fullscreenchange', handleChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleChange);
    };
  }, [isFullscreen, setFullscreen]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (isFullscreen && document.fullscreenElement !== container) {
      container.requestFullscreen().catch(() => setFullscreen(false));
    } else if (!isFullscreen && document.fullscreenElement === container) {
      document.exitFullscreen().catch(() => undefined);
    }
  }, [isFullscreen, setFullscreen]);

  return (
    <div
      className={clsx('video-player', {
        'video-player--audio-only': audioOnly,
        'video-player--empty': !currentVideo
      })}
    >
      <div ref={containerRef} className="video-player__frame" />
      {!currentVideo && <div className="video-player__placeholder">Select something to play</div>}
    </div>
  );
};

export default VideoPlayer;
