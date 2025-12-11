import { useEffect, useRef, useState } from 'react';

interface VideoPlayerProps {
  videoId: string;
  provider?: 'youtube' | 'vimeo' | 'unknown';
  autoplay?: boolean;
}

export function VideoPlayer({ videoId, provider = 'youtube', autoplay = false }: VideoPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(false);
  }, [videoId]);

  const handleError = () => {
    setError(true);
  };

  if (error) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-lg bg-slate-900">
        <div className="text-center">
          <div className="mb-2 text-4xl">⚠️</div>
          <p className="text-sm text-slate-400">Failed to load video</p>
        </div>
      </div>
    );
  }

  if (provider === 'youtube') {
    const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=${autoplay ? 1 : 0}&rel=0`;
    return (
      <iframe
        ref={iframeRef}
        src={embedUrl}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="aspect-video w-full rounded-lg shadow-2xl"
        onError={handleError}
      />
    );
  }

  if (provider === 'vimeo') {
    const embedUrl = `https://player.vimeo.com/video/${videoId}?autoplay=${autoplay ? 1 : 0}`;
    return (
      <iframe
        ref={iframeRef}
        src={embedUrl}
        title="Vimeo video player"
        frameBorder="0"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        className="aspect-video w-full rounded-lg shadow-2xl"
        onError={handleError}
      />
    );
  }

  return (
    <div className="flex aspect-video w-full items-center justify-center rounded-lg bg-slate-900">
      <p className="text-sm text-slate-400">Unsupported video provider</p>
    </div>
  );
}
