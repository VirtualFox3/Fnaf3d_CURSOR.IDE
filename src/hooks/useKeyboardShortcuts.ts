import { useEffect } from 'react';
import { usePlayerStore } from '../store/playerStore';

const isTypingTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName.toLowerCase();
  return (
    target.isContentEditable ||
    tag === 'input' ||
    tag === 'textarea' ||
    tag === 'select' ||
    tag === 'button'
  );
};

export const useKeyboardShortcuts = () => {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target)) {
        return;
      }

      const { togglePlay, seekBy, next, previous } = usePlayerStore.getState();
      const key = event.key.toLowerCase();
      switch (key) {
        case ' ': // Space
        case 'spacebar':
        case 'k':
          event.preventDefault();
          togglePlay();
          break;
        case 'j':
          event.preventDefault();
          seekBy(-10);
          break;
        case 'l':
          event.preventDefault();
          seekBy(10);
          break;
        case 'n':
          event.preventDefault();
          next();
          break;
        case 'p':
          event.preventDefault();
          previous();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);
};
