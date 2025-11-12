export interface Video {
  id: string;
  url: string;
  title: string;
  channel?: string;
  thumbnail?: string;
  duration?: string;
  isFavorite: boolean;
  addedAt: number;
  platform: string;
}

export interface Playlist {
  id: string;
  name: string;
  videoIds: string[];
  createdAt: number;
  updatedAt: number;
}

export interface OEmbedResponse {
  type: string;
  version: string;
  title: string;
  author_name?: string;
  author_url?: string;
  provider_name: string;
  provider_url: string;
  thumbnail_url?: string;
  thumbnail_width?: number;
  thumbnail_height?: number;
  html?: string;
  width?: number;
  height?: number;
}
