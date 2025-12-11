export interface VideoSource {
  id: string;
  provider: 'youtube' | 'vimeo' | 'unknown';
  title: string;
  description?: string;
  thumbnailUrl?: string;
  channelName?: string;
  duration?: string;
  publishedAt?: string;
}
