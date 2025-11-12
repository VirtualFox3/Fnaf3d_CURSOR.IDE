import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { LibraryList } from '../LibraryList';
import { Video } from '../../../types';

const mockVideos: Video[] = [
  {
    id: '1',
    url: 'https://www.youtube.com/watch?v=test1',
    title: 'Test Video 1',
    channel: 'Test Channel 1',
    thumbnail: 'https://example.com/thumb1.jpg',
    isFavorite: true,
    addedAt: Date.now() - 1000,
    platform: 'youtube',
  },
  {
    id: '2',
    url: 'https://vimeo.com/123456',
    title: 'Test Video 2',
    channel: 'Test Channel 2',
    thumbnail: 'https://example.com/thumb2.jpg',
    isFavorite: false,
    addedAt: Date.now(),
    platform: 'vimeo',
  },
];

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('LibraryList', () => {
  it('should show empty state when no videos', () => {
    renderWithRouter(<LibraryList videos={[]} onUpdate={vi.fn()} />);
    
    expect(screen.getByText(/no videos yet/i)).toBeInTheDocument();
  });

  it('should render all videos in grid view by default', () => {
    renderWithRouter(<LibraryList videos={mockVideos} onUpdate={vi.fn()} />);
    
    expect(screen.getByText('Test Video 1')).toBeInTheDocument();
    expect(screen.getByText('Test Video 2')).toBeInTheDocument();
  });

  it('should filter favorites', () => {
    renderWithRouter(<LibraryList videos={mockVideos} onUpdate={vi.fn()} />);
    
    const filterSelect = screen.getByLabelText(/filter videos/i);
    fireEvent.change(filterSelect, { target: { value: 'favorites' } });
    
    expect(screen.getByText('Test Video 1')).toBeInTheDocument();
    expect(screen.queryByText('Test Video 2')).not.toBeInTheDocument();
  });

  it('should sort by title', () => {
    renderWithRouter(<LibraryList videos={mockVideos} onUpdate={vi.fn()} />);
    
    const sortSelect = screen.getByLabelText(/sort videos/i);
    fireEvent.change(sortSelect, { target: { value: 'title' } });
    
    const videoTitles = screen.getAllByRole('heading', { level: 3 });
    expect(videoTitles[0].textContent).toBe('Test Video 1');
    expect(videoTitles[1].textContent).toBe('Test Video 2');
  });

  it('should toggle between grid and list view', () => {
    renderWithRouter(<LibraryList videos={mockVideos} onUpdate={vi.fn()} />);
    
    const listViewButton = screen.getByLabelText(/list view/i);
    fireEvent.click(listViewButton);
    
    // Both buttons should be present
    expect(screen.getByLabelText(/grid view/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/list view/i)).toBeInTheDocument();
  });

  it('should show empty state when filter results in no videos', () => {
    const nonFavoriteVideos: Video[] = [
      {
        id: '1',
        url: 'https://www.youtube.com/watch?v=test1',
        title: 'Test Video',
        isFavorite: false,
        addedAt: Date.now(),
        platform: 'youtube',
      },
    ];

    renderWithRouter(<LibraryList videos={nonFavoriteVideos} onUpdate={vi.fn()} />);
    
    const filterSelect = screen.getByLabelText(/filter videos/i);
    fireEvent.change(filterSelect, { target: { value: 'favorites' } });
    
    expect(screen.getByText(/no videos match the current filter/i)).toBeInTheDocument();
  });
});
