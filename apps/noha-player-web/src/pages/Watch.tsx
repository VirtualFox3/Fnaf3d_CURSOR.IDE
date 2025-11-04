import { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { VideoPlayer } from '../components/VideoPlayer';
import { PlaylistSidebar } from '../components/PlaylistSidebar';
import { QueueDrawer } from '../components/QueueDrawer';
import { useLibraryStore } from '../store/library';
import { usePlayerStore } from '../store/player';
import { useQueueStore } from '../store/queue';
import type { VideoSource } from '../types/media';

export function Watch() {
  const { videoId } = useParams();
  const libraryItems = useLibraryStore((state) => state.items);
  const addToQueue = useQueueStore((state) => state.addToQueue);
  const queueItems = useQueueStore((state) => state.items);
  const loadVideo = usePlayerStore((state) => state.load);

  const video: VideoSource | undefined = useMemo(() => {
    return libraryItems.find((item) => item.id === videoId) ?? queueItems.find((item) => item.id === videoId);
  }, [libraryItems, queueItems, videoId]);

  useEffect(() => {
    if (video) {
      loadVideo(video);
      addToQueue(video);
    }
  }, [video, loadVideo, addToQueue]);

  if (!videoId) {
    return null;
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pb-32 pt-6 lg:flex-row">
      <main className="flex-1 space-y-4">
        <VideoPlayer videoId={videoId} provider={video?.provider ?? 'youtube'} autoplay />
        <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-100">{video?.title ?? 'Now Playing'}</h1>
            {video?.channelName ? (
              <p className="text-sm text-slate-400">{video.channelName}</p>
            ) : null}
          </div>
          <p className="text-sm leading-relaxed text-slate-300">
            Enjoy a distraction-free viewing experience tailored for azadari. Queue multiple titles for
            continuous playback and stay tuned for upcoming metadata and lyrics sync features.
          </p>
          <QueueDrawer />
        </div>
      </main>
      <PlaylistSidebar />
    </div>
  );
}
