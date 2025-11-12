/**
 * Validates if a string is a valid URL
 */
export function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Extracts video ID from various video platform URLs
 */
export function extractVideoId(url: string): { platform: string; videoId: string } | null {
  try {
    const urlObj = new URL(url);
    
    // YouTube
    if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
      let videoId = '';
      
      if (urlObj.hostname.includes('youtu.be')) {
        videoId = urlObj.pathname.slice(1);
      } else if (urlObj.searchParams.has('v')) {
        videoId = urlObj.searchParams.get('v') || '';
      }
      
      if (videoId) {
        return { platform: 'youtube', videoId };
      }
    }
    
    // Vimeo
    if (urlObj.hostname.includes('vimeo.com')) {
      const match = urlObj.pathname.match(/^\/(\d+)/);
      if (match) {
        return { platform: 'vimeo', videoId: match[1] };
      }
    }
    
    // Dailymotion
    if (urlObj.hostname.includes('dailymotion.com') || urlObj.hostname.includes('dai.ly')) {
      const match = urlObj.pathname.match(/\/video\/([a-zA-Z0-9]+)/);
      if (match) {
        return { platform: 'dailymotion', videoId: match[1] };
      }
    }
    
    return null;
  } catch {
    return null;
  }
}

/**
 * Validates if a URL is from a supported video platform
 */
export function isSupportedVideoUrl(url: string): boolean {
  return extractVideoId(url) !== null;
}
