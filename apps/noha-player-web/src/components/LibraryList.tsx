import { Link } from 'react-router-dom';

import { useLibraryStore } from '../store/library';

export function LibraryList() {
  const items = useLibraryStore((state) => state.items);

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-700 p-8 text-center text-slate-400">
        Your library is empty. Paste a URL above to add the first noha to your collection.
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <Link
          to={`/watch/${item.id}`}
          key={item.id}
          className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 shadow-lg shadow-slate-950/40 transition-transform hover:-translate-y-0.5 hover:border-primary-500"
        >
          <div className="relative h-48 overflow-hidden">
            <img
              src={item.thumbnailUrl ?? 'https://placehold.co/320x180?text=No+Art'}
              alt={item.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          </div>
          <div className="flex flex-1 flex-col gap-3 p-4">
            <div>
              <h3 className="text-base font-semibold text-slate-100">{item.title}</h3>
              {item.channelName ? (
                <p className="text-sm text-slate-400">{item.channelName}</p>
              ) : null}
            </div>
            {item.description ? (
              <p className="line-clamp-2 text-sm text-slate-400">{item.description}</p>
            ) : null}
            <div className="mt-auto flex items-center justify-between text-xs text-slate-500">
              <span>Tap to play</span>
              <span>{item.duration ?? '--:--'}</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
