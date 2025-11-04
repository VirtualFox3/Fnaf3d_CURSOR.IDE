import { LibraryList } from '../components/LibraryList';
import { URLPasteForm } from '../components/URLPasteForm';
import { PlaylistSidebar } from '../components/PlaylistSidebar';

export function Library() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 pb-32 pt-6">
      <div>
        <h1 className="mb-1 text-3xl font-bold text-slate-100">My Library</h1>
        <p className="text-sm text-slate-400">
          Your personal collection of nohas, majlis, and azadari sessions.
        </p>
      </div>
      <URLPasteForm />
      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex-1 space-y-6">
          <LibraryList />
        </div>
        <PlaylistSidebar />
      </div>
    </div>
  );
}
