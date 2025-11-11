import { create } from 'zustand';
import { persist, createJSONStorage, type StateStorage } from 'zustand/middleware';
import type { VideoItem } from '../data/playlists';

type RepeatMode = 'off' | 'all' | 'one';

interface HistoryEntry {
  video: VideoItem;
  playedAt: number;
}

interface PlayerState {
  queue: VideoItem[];
  currentIndex: number;
  isReady: boolean;
  isPlaying: boolean;
  volume: number;
  muted: boolean;
  shuffle: boolean;
  repeat: RepeatMode;
  audioOnly: boolean;
  collapsedMiniPlayer: boolean;
  isFullscreen: boolean;
  duration: number;
  currentTime: number;
  history: HistoryEntry[];
  lastPlayed?: VideoItem;
  player?: YT.Player | null;

  setQueue: (queue: VideoItem[], startIndex?: number) => void;
  clearQueue: () => void;
  setCurrentIndex: (index: number) => void;
  setPlayer: (player: YT.Player | null) => void;
  setReady: (ready: boolean) => void;
  setDuration: (duration: number) => void;
  setCurrentTime: (time: number) => void;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  seekBy: (seconds: number) => void;
  seekTo: (seconds: number) => void;
  setVolume: (volume: number) => void;
  setMuted: (muted: boolean) => void;
  toggleMute: () => void;
  setShuffle: (value: boolean) => void;
  toggleShuffle: () => void;
  setRepeat: (mode: RepeatMode) => void;
  cycleRepeat: () => void;
  setAudioOnly: (value: boolean) => void;
  setCollapsedMiniPlayer: (value: boolean) => void;
  toggleCollapsedMiniPlayer: () => void;
  setFullscreen: (value: boolean) => void;
  toggleFullscreen: () => void;
  next: (auto?: boolean) => void;
  previous: () => void;
  registerWatch: (video: VideoItem) => void;
  syncIsPlaying: (value: boolean) => void;
}

const repeatOrder: RepeatMode[] = ['off', 'all', 'one'];

const noopStorage: StateStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined
};

const storage = createJSONStorage<PlayerState>(() => {
  if (typeof window === 'undefined') {
    return noopStorage;
  }
  return {
    getItem: (name) => window.localStorage.getItem(name),
    setItem: (name, value) => window.localStorage.setItem(name, value),
    removeItem: (name) => window.localStorage.removeItem(name)
  } satisfies StateStorage;
});

const clampVolume = (value: number) => Math.min(100, Math.max(0, Math.round(value)));

const randomIndex = (length: number, exclude: number) => {
  if (length <= 1) return exclude;
  let idx = exclude;
  while (idx === exclude) {
    idx = Math.floor(Math.random() * length);
  }
  return idx;
};

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      queue: [],
      currentIndex: -1,
      isReady: false,
      isPlaying: false,
      volume: 70,
      muted: false,
      shuffle: false,
      repeat: 'off',
      audioOnly: false,
      collapsedMiniPlayer: false,
      isFullscreen: false,
      duration: 0,
      currentTime: 0,
      history: [],
      lastPlayed: undefined,
      player: undefined,

      setQueue: (queue, startIndex = 0) => {
        const index = Math.min(Math.max(startIndex, 0), queue.length - 1);
        set({
          queue,
          currentIndex: queue.length ? index : -1,
          isPlaying: queue.length > 0,
          currentTime: 0,
          duration: 0
        });
        const currentVideo = queue[index];
        if (currentVideo) {
          get().registerWatch(currentVideo);
        }
      },
      clearQueue: () => {
        set({ queue: [], currentIndex: -1, isPlaying: false, duration: 0, currentTime: 0 });
        const player = get().player;
        player?.stopVideo?.();
      },
      setCurrentIndex: (index) => {
        const { queue } = get();
        if (!queue.length) return;
        const clamped = Math.min(Math.max(index, 0), queue.length - 1);
        set({ currentIndex: clamped, currentTime: 0, duration: 0, isPlaying: true });
        const video = queue[clamped];
        if (video) {
          get().registerWatch(video);
        }
      },
      setPlayer: (player) => {
        set({ player });
        if (player) {
          const state = get();
          player.setVolume(state.volume);
          if (state.muted) {
            player.mute();
          } else {
            player.unMute();
          }
        }
      },
      setReady: (ready) => set({ isReady: ready }),
      setDuration: (duration) => set({ duration }),
      setCurrentTime: (time) => set({ currentTime: Math.max(0, time) }),
      play: () => {
        const player = get().player;
        player?.playVideo();
        set({ isPlaying: true });
      },
      pause: () => {
        const player = get().player;
        player?.pauseVideo();
        set({ isPlaying: false });
      },
      togglePlay: () => {
        const { isPlaying } = get();
        if (isPlaying) {
          get().pause();
        } else {
          get().play();
        }
      },
      seekBy: (seconds) => {
        const player = get().player;
        if (!player) return;
        const current = player.getCurrentTime?.() ?? get().currentTime;
        const duration = player.getDuration?.() ?? get().duration;
        const target = Math.min(Math.max(current + seconds, 0), duration || Number.MAX_SAFE_INTEGER);
        player.seekTo(target, true);
      },
      seekTo: (seconds) => {
        const player = get().player;
        if (!player) return;
        const duration = player.getDuration?.() ?? get().duration;
        const clamped = Math.min(Math.max(seconds, 0), duration || Number.MAX_SAFE_INTEGER);
        player.seekTo(clamped, true);
        set({ currentTime: clamped });
      },
      setVolume: (volume) => {
        const nextVolume = clampVolume(volume);
        const prevMuted = get().muted;
        const shouldMute = nextVolume === 0 ? true : prevMuted;
        set({ volume: nextVolume, muted: shouldMute });
        const player = get().player;
        player?.setVolume?.(nextVolume);
        if (shouldMute) {
          player?.mute?.();
        } else {
          player?.unMute?.();
        }
      },
      setMuted: (muted) => {
        set({ muted });
        const player = get().player;
        if (muted) {
          player?.mute?.();
        } else {
          player?.unMute?.();
        }
      },
      toggleMute: () => {
        const muted = !get().muted;
        get().setMuted(muted);
      },
      setShuffle: (value) => set({ shuffle: value }),
      toggleShuffle: () => set((state) => ({ shuffle: !state.shuffle })),
      setRepeat: (mode) => set({ repeat: mode }),
      cycleRepeat: () => {
        set((state) => {
          const currentIdx = repeatOrder.indexOf(state.repeat);
          const next = repeatOrder[(currentIdx + 1) % repeatOrder.length];
          return { repeat: next };
        });
      },
      setAudioOnly: (value) => set({ audioOnly: value }),
      setCollapsedMiniPlayer: (value) => set({ collapsedMiniPlayer: value }),
      toggleCollapsedMiniPlayer: () => set((state) => ({ collapsedMiniPlayer: !state.collapsedMiniPlayer })),
      setFullscreen: (value) => set({ isFullscreen: value }),
      toggleFullscreen: () => set((state) => ({ isFullscreen: !state.isFullscreen })),
      next: (auto = false) => {
        const state = get();
        const { queue, currentIndex, repeat, shuffle, player } = state;
        if (!queue.length) return;
        if (auto && repeat === 'one') {
          player?.seekTo?.(0, true);
          player?.playVideo?.();
          return;
        }

        let nextIndex = currentIndex;
        if (shuffle) {
          nextIndex = randomIndex(queue.length, currentIndex);
        } else {
          nextIndex += 1;
        }

        if (nextIndex >= queue.length) {
          if (repeat === 'all') {
            nextIndex = 0;
          } else {
            player?.stopVideo?.();
            set({ isPlaying: false });
            return;
          }
        }

        set({ currentIndex: nextIndex, isPlaying: true, currentTime: 0, duration: 0 });
        const nextVideo = queue[nextIndex];
        if (nextVideo) {
          state.registerWatch(nextVideo);
        }
      },
      previous: () => {
        const state = get();
        const { queue, currentIndex, repeat, shuffle } = state;
        if (!queue.length) return;

        if (shuffle && state.history.length > 1) {
          const [, previousEntry] = state.history;
          if (previousEntry) {
            const index = queue.findIndex((item) => item.id === previousEntry.video.id);
            if (index !== -1) {
              set({ currentIndex: index, isPlaying: true, currentTime: 0, duration: 0 });
              const target = queue[index];
              if (target) {
                state.registerWatch(target);
              }
              return;
            }
          }
        }

        let prevIndex = currentIndex - 1;
        if (prevIndex < 0) {
          if (repeat === 'all') {
            prevIndex = queue.length - 1;
          } else {
            const player = state.player;
            player?.seekTo?.(0, true);
            player?.playVideo?.();
            return;
          }
        }

        set({ currentIndex: prevIndex, isPlaying: true, currentTime: 0, duration: 0 });
        const prevVideo = queue[prevIndex];
        if (prevVideo) {
          state.registerWatch(prevVideo);
        }
      },
      registerWatch: (video) => {
        set((state) => {
          const filtered = state.history.filter((entry) => entry.video.id !== video.id);
          const updated: HistoryEntry[] = [{ video, playedAt: Date.now() }, ...filtered];
          return {
            history: updated.slice(0, 50),
            lastPlayed: video
          };
        });
      },
      syncIsPlaying: (value) => set({ isPlaying: value })
    }),
    {
      name: 'vidflow-player',
      storage,
      partialize: (state) => ({
        queue: state.queue,
        currentIndex: state.currentIndex,
        isPlaying: state.isPlaying,
        volume: state.volume,
        muted: state.muted,
        shuffle: state.shuffle,
        repeat: state.repeat,
        audioOnly: state.audioOnly,
        collapsedMiniPlayer: state.collapsedMiniPlayer,
        history: state.history,
        lastPlayed: state.lastPlayed
      })
    }
  )
);

export type { RepeatMode, HistoryEntry };
