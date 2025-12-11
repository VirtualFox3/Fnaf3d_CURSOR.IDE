import type { VideoSource } from './media';

export interface Playlist {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  videos: VideoSource[];
}
