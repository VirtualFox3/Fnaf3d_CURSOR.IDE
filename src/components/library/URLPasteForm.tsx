import { useState } from 'react';
import { isValidUrl, isSupportedVideoUrl, extractVideoId } from '../../utils/urlUtils';
import { fetchOEmbedData } from '../../services/oembedService';
import { storageService } from '../../services/storageService';
import { Video } from '../../types';

interface URLPasteFormProps {
  onVideoAdded?: () => void;
}

export function URLPasteForm({ onVideoAdded }: URLPasteFormProps) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validate URL
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    if (!isValidUrl(url)) {
      setError('Please enter a valid URL');
      return;
    }

    if (!isSupportedVideoUrl(url)) {
      setError('Unsupported video platform. Supported: YouTube, Vimeo, Dailymotion');
      return;
    }

    setLoading(true);

    try {
      // Extract video info
      const videoInfo = extractVideoId(url);
      if (!videoInfo) {
        throw new Error('Failed to extract video information');
      }

      // Check if video already exists
      const existingVideos = storageService.getVideos();
      if (existingVideos.some(v => v.url === url)) {
        setError('This video is already in your library');
        setLoading(false);
        return;
      }

      // Fetch oEmbed data
      const oembedData = await fetchOEmbedData(url);

      // Create video object
      const video: Video = {
        id: `${videoInfo.platform}-${videoInfo.videoId}-${Date.now()}`,
        url,
        title: oembedData.title,
        channel: oembedData.author_name,
        thumbnail: oembedData.thumbnail_url,
        duration: undefined,
        isFavorite: false,
        addedAt: Date.now(),
        platform: videoInfo.platform,
      };

      // Save video
      storageService.addVideo(video);

      // Reset form
      setUrl('');
      setSuccess(true);
      setLoading(false);

      // Notify parent component
      if (onVideoAdded) {
        onVideoAdded();
      }

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setLoading(false);
      setError(err instanceof Error ? err.message : 'Failed to add video');
    }
  };

  return (
    <div className="card p-6">
      <h2 className="text-2xl font-bold mb-4">Add Video</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="video-url" className="block text-sm font-medium mb-2">
            Video URL
          </label>
          <input
            id="video-url"
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste YouTube, Vimeo, or Dailymotion URL"
            className="input-field"
            disabled={loading}
            aria-describedby={error ? 'url-error' : undefined}
          />
          <p className="mt-2 text-xs text-gray-500">
            Supported platforms: YouTube, Vimeo, Dailymotion
          </p>
        </div>

        {error && (
          <div
            id="url-error"
            className="p-3 bg-red-900/50 border border-red-700 rounded-lg text-sm text-red-200"
            role="alert"
          >
            {error}
          </div>
        )}

        {success && (
          <div
            className="p-3 bg-green-900/50 border border-green-700 rounded-lg text-sm text-green-200"
            role="status"
          >
            Video added successfully!
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full sm:w-auto"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Adding...
            </span>
          ) : (
            'Add Video'
          )}
        </button>
      </form>
    </div>
  );
}
