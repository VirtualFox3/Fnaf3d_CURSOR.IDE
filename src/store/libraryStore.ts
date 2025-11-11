import { create } from 'zustand';
import { persist, createJSONStorage, type StateStorage } from 'zustand/middleware';
import { Playlist, VideoItem, seededPlaylists } from '../data/playlists';

type PlaylistUpdate = Partial<Pick<Playlist, 'title' | 'description' | 'coverImage'>>;

interface LibraryState {
  playlists: Playlist[];
  getPlaylist: (id: string) => Playlist | undefined;
  updatePlaylistMetadata: (id: string, update: PlaylistUpdate) => void;
  reorderVideos: (payload: { playlistId: string; from: number; to: number }) => void;
  addVideoToPlaylist: (payload: { playlistId: string; video: VideoItem; position?: number }) => void;
  removeVideoFromPlaylist: (payload: { playlistId: string; videoId: string }) => void;
}

const noopStorage: StateStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined
};

const storage = createJSONStorage<LibraryState>(() => {
  if (typeof window === 'undefined') {
    return noopStorage;
  }
  return {
    getItem: (name) => window.localStorage.getItem(name),
    setItem: (name, value) => window.localStorage.setItem(name, value),
    removeItem: (name) => window.localStorage.removeItem(name)
  } satisfies StateStorage;
});

export const useLibraryStore = create<LibraryState>()(
  persist(
    (set, get) => ({
      playlists: seededPlaylists,
      getPlaylist: (id) => get().playlists.find((playlist) => playlist.id === id),
      updatePlaylistMetadata: (id, update) => {
        set((state) => ({
          playlists: state.playlists.map((playlist) =>
            playlist.id === id ? { ...playlist, ...update, updatedAt: new Date().toISOString() } : playlist
          )
        }));
      },
      reorderVideos: ({ playlistId, from, to }) => {
        if (from === to) return;
        set((state) => ({
          playlists: state.playlists.map((playlist) => {
            if (playlist.id !== playlistId) return playlist;
            const updatedVideos = [...playlist.videos];
            const [moved] = updatedVideos.splice(from, 1);
            updatedVideos.splice(to, 0, moved);
            return {
              ...playlist,
              videos: updatedVideos,
              updatedAt: new Date().toISOString()
            };
          })
        }));
      },
      addVideoToPlaylist: ({ playlistId, video, position }) => {
        set((state) => ({
          playlists: state.playlists.map((playlist) => {
            if (playlist.id !== playlistId) return playlist;
            const alreadyExists = playlist.videos.some((entry) => entry.id === video.id);
            if (alreadyExists) {
              return playlist;
            }
            const videos = [...playlist.videos];
            const insertionIndex = position !== undefined ? Math.max(0, Math.min(videos.length, position)) : videos.length;
            videos.splice(insertionIndex, 0, video);
            return {
              ...playlist,
              videos,
              updatedAt: new Date().toISOString()
            };
          })
        }));
      },
      removeVideoFromPlaylist: ({ playlistId, videoId }) => {
        set((state) => ({
          playlists: state.playlists.map((playlist) =>
            playlist.id === playlistId
              ? {
                  ...playlist,
                  videos: playlist.videos.filter((video) => video.id !== videoId),
                  updatedAt: new Date().toISOString()
                }
              : playlist
          )
        }));
      }
    }),
    {
      name: 'vidflow-library',
      storage
    }
  )
);
