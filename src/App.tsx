import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { LibraryPage } from './pages/LibraryPage';
import { WatchPage } from './pages/WatchPage';
import { PlaylistPage } from './pages/PlaylistPage';

export function App() {
  return (
    <Router>
      <AppShell>
        <Routes>
          <Route path="/" element={<LibraryPage />} />
          <Route path="/watch/:videoId" element={<WatchPage />} />
          <Route path="/playlist/:id" element={<PlaylistPage />} />
        </Routes>
      </AppShell>
    </Router>
  );
}
