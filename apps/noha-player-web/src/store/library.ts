import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { VideoSource } from '../types/media';

const starterVideos: VideoSource[] = [
  {
    id: 'dQw4w9WgXcQ',
    provider: 'youtube',
    title: 'Noha Majlis Highlights',
    description: 'A curated playlist of essential majlis performances to get started.',
    thumbnailUrl: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
    channelName: 'Noha Collective',
  },
  {
    id: 'gH476CxJxfg',
    provider: 'youtube',
    title: 'Azadari Session 2023',
    description: 'Experience the ambience of a full azadari session recorded live.',
    thumbnailUrl: 'https://i.ytimg.com/vi/gH476CxJxfg/hqdefault.jpg',
    channelName: 'Azadari Archive',
  },
  {
    id: 'mWRsgZuwf_8',
    provider: 'youtube',
    title: 'Soz & Salam Collection',
    description: 'A tranquil collection of soz and salam renditions for reflection.',
    thumbnailUrl: 'https://i.ytimg.com/vi/mWRsgZuwf_8/hqdefault.jpg',
    channelName: 'Noha Heritage',
  },
];

interface LibraryState {
  items: VideoSource[];
  addToLibrary: (video: VideoSource) => void;
  removeFromLibrary: (id: string) => void;
  resetLibrary: () => void;
}

export const useLibraryStore = create<LibraryState>()(
  persist(
    (set, get) => ({
      items: starterVideos,
      addToLibrary: (video) => {
        const exists = get().items.some((item) => item.id === video.id);
        if (exists) {
          return;
        }
        set((state) => ({ items: [video, ...state.items] }));
      },
      removeFromLibrary: (id) => {
        set((state) => ({ items: state.items.filter((item) => item.id !== id) }));
      },
      resetLibrary: () => set({ items: starterVideos }),
    }),
    {
      name: 'noha-library-storage',
      storage: typeof window !== 'undefined'
        ? createJSONStorage(() => window.localStorage)
        : undefined,
    }
  )
);
