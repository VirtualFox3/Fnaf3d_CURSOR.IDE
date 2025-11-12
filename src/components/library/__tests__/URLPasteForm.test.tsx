import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { URLPasteForm } from '../URLPasteForm';
import * as oembedService from '../../../services/oembedService';
import * as storageService from '../../../services/storageService';

vi.mock('../../../services/oembedService');
vi.mock('../../../services/storageService');

describe('URLPasteForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(storageService.storageService, 'getVideos').mockReturnValue([]);
    vi.spyOn(storageService.storageService, 'addVideo').mockImplementation(() => {});
  });

  it('should render the form with input and submit button', () => {
    render(<URLPasteForm />);
    
    expect(screen.getByLabelText(/video url/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add video/i })).toBeInTheDocument();
  });

  it('should show error when submitting empty URL', async () => {
    render(<URLPasteForm />);
    
    const submitButton = screen.getByRole('button', { name: /add video/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/please enter a url/i)).toBeInTheDocument();
    });
  });

  it('should show error for invalid URL', async () => {
    render(<URLPasteForm />);
    
    const input = screen.getByLabelText(/video url/i);
    fireEvent.change(input, { target: { value: 'not a valid url' } });
    
    const submitButton = screen.getByRole('button', { name: /add video/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid url/i)).toBeInTheDocument();
    });
  });

  it('should show error for unsupported video platform', async () => {
    render(<URLPasteForm />);
    
    const input = screen.getByLabelText(/video url/i);
    fireEvent.change(input, { target: { value: 'https://example.com/video' } });
    
    const submitButton = screen.getByRole('button', { name: /add video/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/unsupported video platform/i)).toBeInTheDocument();
    });
  });

  it('should show loading state while fetching video data', async () => {
    const mockFetchOEmbed = vi.spyOn(oembedService, 'fetchOEmbedData')
      .mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(<URLPasteForm />);
    
    const input = screen.getByLabelText(/video url/i);
    fireEvent.change(input, { target: { value: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' } });
    
    const submitButton = screen.getByRole('button', { name: /add video/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/adding/i)).toBeInTheDocument();
    });
  });

  it('should successfully add a valid YouTube video', async () => {
    const mockOEmbedData = {
      type: 'video',
      version: '1.0',
      title: 'Test Video',
      author_name: 'Test Channel',
      thumbnail_url: 'https://example.com/thumb.jpg',
      provider_name: 'YouTube',
      provider_url: 'https://youtube.com',
    };

    vi.spyOn(oembedService, 'fetchOEmbedData').mockResolvedValue(mockOEmbedData);

    const onVideoAdded = vi.fn();
    render(<URLPasteForm onVideoAdded={onVideoAdded} />);
    
    const input = screen.getByLabelText(/video url/i);
    fireEvent.change(input, { target: { value: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' } });
    
    const submitButton = screen.getByRole('button', { name: /add video/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/video added successfully/i)).toBeInTheDocument();
    });

    expect(storageService.storageService.addVideo).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Test Video',
        channel: 'Test Channel',
        thumbnail: 'https://example.com/thumb.jpg',
      })
    );
    expect(onVideoAdded).toHaveBeenCalled();
  });

  it('should show error when video already exists', async () => {
    const existingVideo = {
      id: '1',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      title: 'Existing Video',
      isFavorite: false,
      addedAt: Date.now(),
      platform: 'youtube',
    };

    vi.spyOn(storageService.storageService, 'getVideos').mockReturnValue([existingVideo]);

    render(<URLPasteForm />);
    
    const input = screen.getByLabelText(/video url/i);
    fireEvent.change(input, { target: { value: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' } });
    
    const submitButton = screen.getByRole('button', { name: /add video/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/already in your library/i)).toBeInTheDocument();
    });
  });

  it('should handle oEmbed fetch errors', async () => {
    vi.spyOn(oembedService, 'fetchOEmbedData').mockRejectedValue(new Error('Network error'));

    render(<URLPasteForm />);
    
    const input = screen.getByLabelText(/video url/i);
    fireEvent.change(input, { target: { value: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' } });
    
    const submitButton = screen.getByRole('button', { name: /add video/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });
  });
});
