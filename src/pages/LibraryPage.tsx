import { useState, useEffect } from 'react';
import { URLPasteForm } from '../components/library/URLPasteForm';
import { LibraryList } from '../components/library/LibraryList';
import { Video } from '../types';
import { storageService } from '../services/storageService';

export function LibraryPage() {
  const [videos, setVideos] = useState<Video[]>([]);

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = () => {
    setVideos(storageService.getVideos());
  };

  return (
    <div className="space-y-8">
      <URLPasteForm onVideoAdded={loadVideos} />
      <LibraryList videos={videos} onUpdate={loadVideos} />
    </div>
  );
}
