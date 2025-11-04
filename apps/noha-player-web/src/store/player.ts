import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { VideoSource } from '../types/media';

interface PlayerState {
  current?: VideoSource;
  isPlaying: boolean;
  volume: number;
  muted: boolean;

  load: (video: VideoSource) => void;
  togglePlay: () => void;
  setPlaying: (playing: boolean) => void;
  setVolume: (value: number) => void;
  toggleMute: () => void;
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set) => ({
      current: undefined,
      isPlaying: false,
      volume: 0.8,
      muted: false,

      load: (video) => set({ current: video, isPlaying: true }),
      togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
      setPlaying: (playing) => set({ isPlaying: playing }),
      setVolume: (value) => set({ volume: Math.min(1, Math.max(0, value)) }),
      toggleMute: () => set((state) => ({ muted: !state.muted })),
    }),
    {
      name: 'noha-player-storage',
      storage: typeof window !== 'undefined'
        ? createJSONStorage(() => window.localStorage)
        : undefined,
    }
  )
);
