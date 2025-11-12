import { Video, Playlist } from '../types';

const VIDEOS_KEY = 'video-library-videos';
const PLAYLISTS_KEY = 'video-library-playlists';

export const storageService = {
  // Video operations
  getVideos(): Video[] {
    try {
      const data = localStorage.getItem(VIDEOS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveVideos(videos: Video[]): void {
    localStorage.setItem(VIDEOS_KEY, JSON.stringify(videos));
  },

  addVideo(video: Video): void {
    const videos = this.getVideos();
    videos.unshift(video);
    this.saveVideos(videos);
  },

  updateVideo(videoId: string, updates: Partial<Video>): void {
    const videos = this.getVideos();
    const index = videos.findIndex(v => v.id === videoId);
    if (index !== -1) {
      videos[index] = { ...videos[index], ...updates };
      this.saveVideos(videos);
    }
  },

  deleteVideo(videoId: string): void {
    const videos = this.getVideos().filter(v => v.id !== videoId);
    this.saveVideos(videos);
  },

  getVideo(videoId: string): Video | null {
    const videos = this.getVideos();
    return videos.find(v => v.id === videoId) || null;
  },

  // Playlist operations
  getPlaylists(): Playlist[] {
    try {
      const data = localStorage.getItem(PLAYLISTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  savePlaylists(playlists: Playlist[]): void {
    localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(playlists));
  },

  addPlaylist(playlist: Playlist): void {
    const playlists = this.getPlaylists();
    playlists.push(playlist);
    this.savePlaylists(playlists);
  },

  updatePlaylist(playlistId: string, updates: Partial<Playlist>): void {
    const playlists = this.getPlaylists();
    const index = playlists.findIndex(p => p.id === playlistId);
    if (index !== -1) {
      playlists[index] = { ...playlists[index], ...updates };
      this.savePlaylists(playlists);
    }
  },

  deletePlaylist(playlistId: string): void {
    const playlists = this.getPlaylists().filter(p => p.id !== playlistId);
    this.savePlaylists(playlists);
  },

  getPlaylist(playlistId: string): Playlist | null {
    const playlists = this.getPlaylists();
    return playlists.find(p => p.id === playlistId) || null;
  },

  addVideoToPlaylist(playlistId: string, videoId: string): void {
    const playlists = this.getPlaylists();
    const index = playlists.findIndex(p => p.id === playlistId);
    if (index !== -1 && !playlists[index].videoIds.includes(videoId)) {
      playlists[index].videoIds.push(videoId);
      playlists[index].updatedAt = Date.now();
      this.savePlaylists(playlists);
    }
  },

  removeVideoFromPlaylist(playlistId: string, videoId: string): void {
    const playlists = this.getPlaylists();
    const index = playlists.findIndex(p => p.id === playlistId);
    if (index !== -1) {
      playlists[index].videoIds = playlists[index].videoIds.filter(id => id !== videoId);
      playlists[index].updatedAt = Date.now();
      this.savePlaylists(playlists);
    }
  },
};
