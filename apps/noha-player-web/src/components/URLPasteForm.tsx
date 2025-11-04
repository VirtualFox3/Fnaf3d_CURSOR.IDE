import { useState } from 'react';

export function URLPasteForm() {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('URL submitted:', url);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="rounded-lg border border-slate-700 bg-slate-900 p-4">
        <label htmlFor="video-url" className="mb-2 block text-sm font-medium text-slate-200">
          Paste video URL
        </label>
        <div className="flex gap-2">
          <input
            id="video-url"
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="flex-1 rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-md bg-primary-500 px-4 py-2 text-sm font-medium text-slate-950 transition-colors hover:bg-primary-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            Add
          </button>
        </div>
        <p className="mt-2 text-xs text-slate-400">
          Supported platforms: YouTube, Vimeo
        </p>
      </div>
    </form>
  );
}
