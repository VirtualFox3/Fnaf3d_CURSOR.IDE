import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { VideoSource } from '../types/media';

interface QueueState {
  items: VideoSource[];
  currentIndex: number;
  isOpen: boolean;

  setQueue: (videos: VideoSource[]) => void;
  addToQueue: (video: VideoSource) => void;
  removeFromQueue: (id: string) => void;
  clearQueue: () => void;
  setCurrentIndex: (index: number) => void;
  playNext: () => void;
  playPrevious: () => void;
  toggleOpen: () => void;
  setOpen: (open: boolean) => void;
}

export const useQueueStore = create<QueueState>()(
  persist(
    (set, get) => ({
      items: [],
      currentIndex: -1,
      isOpen: false,

      setQueue: (videos) => set({ items: videos, currentIndex: videos.length > 0 ? 0 : -1 }),

      addToQueue: (video) => {
        const state = get();
        const exists = state.items.some((item) => item.id === video.id);
        if (exists) {
          return;
        }
        set((state) => ({
          items: [...state.items, video],
          currentIndex: state.currentIndex === -1 ? 0 : state.currentIndex,
        }));
      },

      removeFromQueue: (id) => {
        const state = get();
        const index = state.items.findIndex((item) => item.id === id);
        if (index === -1) {
          return;
        }
        const newItems = state.items.filter((item) => item.id !== id);
        let newIndex = state.currentIndex;
        if (index < state.currentIndex) {
          newIndex -= 1;
        } else if (index === state.currentIndex) {
          newIndex = Math.min(newIndex, newItems.length - 1);
        }
        set({ items: newItems, currentIndex: newIndex >= 0 ? newIndex : -1 });
      },

      clearQueue: () => set({ items: [], currentIndex: -1 }),

      setCurrentIndex: (index) => set({ currentIndex: index }),

      playNext: () => {
        const state = get();
        if (state.currentIndex < state.items.length - 1) {
          set({ currentIndex: state.currentIndex + 1 });
        }
      },

      playPrevious: () => {
        const state = get();
        if (state.currentIndex > 0) {
          set({ currentIndex: state.currentIndex - 1 });
        }
      },

      toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),

      setOpen: (open) => set({ isOpen: open }),
    }),
    {
      name: 'noha-queue-storage',
      storage: typeof window !== 'undefined'
        ? createJSONStorage(() => window.localStorage)
        : undefined,
    }
  )
);
