import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Video } from '../types';
import { storageService } from '../services/storageService';

export function WatchPage() {
  const { videoId } = useParams<{ videoId: string }>();
  const navigate = useNavigate();
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!videoId) {
      navigate('/');
      return;
    }

    const foundVideo = storageService.getVideo(videoId);
    if (!foundVideo) {
      navigate('/');
      return;
    }

    setVideo(foundVideo);
    setLoading(false);
  }, [videoId, navigate]);

  const getEmbedUrl = (video: Video): string => {
    const videoInfo = video.url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|vimeo\.com\/|dailymotion\.com\/video\/)([a-zA-Z0-9_-]+)/);
    
    if (video.platform === 'youtube') {
      const videoId = new URL(video.url).searchParams.get('v') || video.url.split('/').pop();
      return `https://www.youtube.com/embed/${videoId}`;
    } else if (video.platform === 'vimeo') {
      const videoId = video.url.split('/').pop();
      return `https://player.vimeo.com/video/${videoId}`;
    } else if (video.platform === 'dailymotion') {
      const videoId = videoInfo?.[1];
      return `https://www.dailymotion.com/embed/video/${videoId}`;
    }
    
    return '';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <svg
            className="animate-spin h-12 w-12 text-blue-500 mx-auto"
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
          <p className="mt-4 text-gray-400">Loading video...</p>
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-300 mb-4">Video not found</h2>
        <Link to="/" className="text-blue-400 hover:text-blue-300">
          Back to Library
        </Link>
      </div>
    );
  }

  const embedUrl = getEmbedUrl(video);

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link
        to="/"
        className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors"
      >
        <svg
          className="w-5 h-5 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
        Back to Library
      </Link>

      {/* Video player */}
      <div className="card overflow-hidden">
        <div className="aspect-video bg-black">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              className="w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={video.title}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              Unable to load video player
            </div>
          )}
        </div>

        {/* Video info */}
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-2">{video.title}</h1>
          {video.channel && (
            <p className="text-gray-400 mb-4">{video.channel}</p>
          )}
          
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span className="capitalize">{video.platform}</span>
            <span>•</span>
            <span>Added {new Date(video.addedAt).toLocaleDateString()}</span>
            {video.isFavorite && (
              <>
                <span>•</span>
                <span className="flex items-center text-yellow-500">
                  <svg className="w-4 h-4 mr-1 fill-current" viewBox="0 0 24 24">
                    <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  Favorite
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
