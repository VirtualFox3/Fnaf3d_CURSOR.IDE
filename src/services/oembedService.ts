import { OEmbedResponse } from '../types';
import { extractVideoId } from '../utils/urlUtils';

/**
 * Fetches oEmbed data for a video URL
 */
export async function fetchOEmbedData(url: string): Promise<OEmbedResponse> {
  const videoInfo = extractVideoId(url);
  
  if (!videoInfo) {
    throw new Error('Unsupported video URL');
  }
  
  let oembedUrl = '';
  
  switch (videoInfo.platform) {
    case 'youtube':
      oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
      break;
    case 'vimeo':
      oembedUrl = `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}`;
      break;
    case 'dailymotion':
      oembedUrl = `https://www.dailymotion.com/services/oembed?url=${encodeURIComponent(url)}&format=json`;
      break;
    default:
      throw new Error('Unsupported platform');
  }
  
  try {
    const response = await fetch(oembedUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch video data: ${response.statusText}`);
    }
    
    const data: OEmbedResponse = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch video metadata: ${error.message}`);
    }
    throw new Error('Failed to fetch video metadata');
  }
}

/**
 * Extracts duration from video platforms (where available)
 * Note: oEmbed doesn't always provide duration, so this may return null
 */
export function extractDuration(oembedData: OEmbedResponse): string | null {
  // oEmbed typically doesn't provide duration
  // This would require additional API calls to platform-specific APIs
  return null;
}
