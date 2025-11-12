import { ReactNode, useState } from 'react';
import { Header } from './Header';
import { PlaylistSidebar } from './PlaylistSidebar';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <Header 
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
      />
      
      <div className="flex">
        <PlaylistSidebar isOpen={isSidebarOpen} />
        
        <main 
          className={`flex-1 transition-all duration-300 ${
            isSidebarOpen ? 'ml-0 md:ml-64' : 'ml-0'
          }`}
        >
          <div className="container mx-auto px-4 py-6 max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
