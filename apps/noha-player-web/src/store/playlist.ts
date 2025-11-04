import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { Playlist } from '../types/playlist';
import type { VideoSource } from '../types/media';

interface PlaylistState {
  playlists: Playlist[];
  createPlaylist: (name: string) => Playlist;
  deletePlaylist: (id: string) => void;
  addVideoToPlaylist: (playlistId: string, video: VideoSource) => void;
  removeVideoFromPlaylist: (playlistId: string, videoId: string) => void;
  getPlaylistById: (id: string) => Playlist | undefined;
}

export const usePlaylistStore = create<PlaylistState>()(
  persist(
    (set, get) => ({
      playlists: [],

      createPlaylist: (name) => {
        const now = new Date().toISOString();
        const newPlaylist: Playlist = {
          id: `pl-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          name,
          createdAt: now,
          updatedAt: now,
          videos: [],
        };
        set((state) => ({ playlists: [...state.playlists, newPlaylist] }));
        return newPlaylist;
      },

      deletePlaylist: (id) => {
        set((state) => ({ playlists: state.playlists.filter((pl) => pl.id !== id) }));
      },

      addVideoToPlaylist: (playlistId, video) => {
        set((state) => ({
          playlists: state.playlists.map((pl) => {
            if (pl.id !== playlistId) {
              return pl;
            }
            const alreadyExists = pl.videos.some((v) => v.id === video.id);
            if (alreadyExists) {
              return pl;
            }
            return {
              ...pl,
              videos: [...pl.videos, video],
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
      },

      removeVideoFromPlaylist: (playlistId, videoId) => {
        set((state) => ({
          playlists: state.playlists.map((pl) => {
            if (pl.id !== playlistId) {
              return pl;
            }
            return {
              ...pl,
              videos: pl.videos.filter((v) => v.id !== videoId),
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
      },

      getPlaylistById: (id) => {
        return get().playlists.find((pl) => pl.id === id);
      },
    }),
    {
      name: 'noha-playlists-storage',
      storage: typeof window !== 'undefined'
        ? createJSONStorage(() => window.localStorage)
        : undefined,
    }
  )
);
