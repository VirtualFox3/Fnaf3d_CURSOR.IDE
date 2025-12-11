import { useEffect } from 'react';
import { Link } from 'react-router-dom';

import { useQueueStore } from '../store/queue';

export function QueueDrawer() {
  const { items, isOpen, toggleOpen, setOpen, removeFromQueue } = useQueueStore((state) => ({
    items: state.items,
    isOpen: state.isOpen,
    toggleOpen: state.toggleOpen,
    setOpen: state.setOpen,
    removeFromQueue: state.removeFromQueue,
  }));

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [setOpen]);

  return (
    <>
      <button
        type="button"
        onClick={toggleOpen}
        className="inline-flex items-center gap-2 rounded-md border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-200 transition-all hover:border-primary-500 hover:text-primary-200 lg:hidden"
      >
        Queue
        <span className="inline-flex h-5 min-w-[1.5rem] items-center justify-center rounded-full bg-slate-800 px-2 text-[0.65rem] font-semibold text-slate-200">
          {items.length}
        </span>
      </button>

      <div
        className={`fixed inset-0 z-40 transition ${
          isOpen ? 'pointer-events-auto' : 'pointer-events-none'
        } lg:hidden`}
      >
        <div
          className={`absolute inset-0 bg-slate-950/70 transition-opacity ${
            isOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setOpen(false)}
        />
        <div
          className={`absolute bottom-0 left-0 right-0 transform rounded-t-3xl border border-slate-800 bg-slate-900/95 p-4 shadow-2xl transition-transform duration-300 ${
            isOpen ? 'translate-y-0' : 'translate-y-full'
          }`}
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 1rem)' }}
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-100">Up Next</h3>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 text-slate-200 hover:bg-slate-800"
              aria-label="Close queue"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="h-4 w-4"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6m0 12L6 6" />
              </svg>
            </button>
          </div>
          <ul className="space-y-3">
            {items.length === 0 ? (
              <li className="rounded-lg border border-dashed border-slate-700 p-4 text-xs text-slate-400">
                Queue is empty
              </li>
            ) : (
              items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/50 p-3"
                >
                  <Link to={`/watch/${item.id}`} className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-100">{item.title}</p>
                    {item.channelName ? (
                      <span className="truncate text-xs text-slate-400">{item.channelName}</span>
                    ) : null}
                  </Link>
                  <button
                    type="button"
                    onClick={() => removeFromQueue(item.id)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 text-slate-300 hover:bg-slate-800"
                    aria-label="Remove from queue"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className="h-4 w-4"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6m0 12L6 6" />
                    </svg>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </>
  );
}
