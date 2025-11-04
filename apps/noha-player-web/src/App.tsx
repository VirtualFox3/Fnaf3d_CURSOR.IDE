import { Route, Routes } from 'react-router-dom';

import { Header } from './components/Header';
import { NowPlayingBar } from './components/NowPlayingBar';
import { Library } from './pages/Library';
import { Playlist } from './pages/Playlist';
import { Watch } from './pages/Watch';

function App() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      <Header />
      <div className="flex-1 pb-24">
        <Routes>
          <Route path="/" element={<Library />} />
          <Route path="/watch/:videoId" element={<Watch />} />
          <Route path="/playlist/:id" element={<Playlist />} />
          <Route
            path="*"
            element={
              <div className="mx-auto w-full max-w-4xl px-4 py-24 text-center">
                <h1 className="text-4xl font-bold text-white">Page not found</h1>
              </div>
            }
          />
        </Routes>
      </div>
      <NowPlayingBar />
    </div>
  );
}

export default App;
