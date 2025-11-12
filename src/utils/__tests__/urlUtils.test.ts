import { describe, it, expect } from 'vitest';
import { isValidUrl, isSupportedVideoUrl, extractVideoId } from '../urlUtils';

describe('urlUtils', () => {
  describe('isValidUrl', () => {
    it('should return true for valid HTTP URLs', () => {
      expect(isValidUrl('http://example.com')).toBe(true);
      expect(isValidUrl('https://example.com')).toBe(true);
    });

    it('should return false for invalid URLs', () => {
      expect(isValidUrl('not a url')).toBe(false);
      expect(isValidUrl('')).toBe(false);
      expect(isValidUrl('ftp://example.com')).toBe(false);
    });
  });

  describe('extractVideoId', () => {
    it('should extract YouTube video IDs from various URL formats', () => {
      expect(extractVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toEqual({
        platform: 'youtube',
        videoId: 'dQw4w9WgXcQ',
      });

      expect(extractVideoId('https://youtu.be/dQw4w9WgXcQ')).toEqual({
        platform: 'youtube',
        videoId: 'dQw4w9WgXcQ',
      });
    });

    it('should extract Vimeo video IDs', () => {
      expect(extractVideoId('https://vimeo.com/123456789')).toEqual({
        platform: 'vimeo',
        videoId: '123456789',
      });
    });

    it('should extract Dailymotion video IDs', () => {
      expect(extractVideoId('https://www.dailymotion.com/video/x8abc123')).toEqual({
        platform: 'dailymotion',
        videoId: 'x8abc123',
      });
    });

    it('should return null for unsupported URLs', () => {
      expect(extractVideoId('https://example.com')).toBeNull();
      expect(extractVideoId('not a url')).toBeNull();
    });
  });

  describe('isSupportedVideoUrl', () => {
    it('should return true for supported video platforms', () => {
      expect(isSupportedVideoUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(true);
      expect(isSupportedVideoUrl('https://vimeo.com/123456789')).toBe(true);
      expect(isSupportedVideoUrl('https://www.dailymotion.com/video/x8abc123')).toBe(true);
    });

    it('should return false for unsupported URLs', () => {
      expect(isSupportedVideoUrl('https://example.com')).toBe(false);
      expect(isSupportedVideoUrl('not a url')).toBe(false);
    });
  });
});
