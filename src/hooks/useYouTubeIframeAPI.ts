import { useEffect, useState } from 'react';

declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void;
    YT?: typeof YT;
  }
}

const SCRIPT_SRC = 'https://www.youtube.com/iframe_api';

let isLoading = false;
let isLoaded = false;
const readyCallbacks = new Set<() => void>();

const injectScript = () => {
  if (typeof document === 'undefined') return;
  if (document.querySelector(`script[src="${SCRIPT_SRC}"]`)) {
    return;
  }

  const script = document.createElement('script');
  script.src = SCRIPT_SRC;
  script.async = true;
  document.head.appendChild(script);
};

export const useYouTubeIframeAPI = () => {
  const [ready, setReady] = useState(() => (typeof window !== 'undefined' ? isLoaded && Boolean(window.YT) : false));

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (isLoaded && window.YT) {
      setReady(true);
      return;
    }

    const callback = () => setReady(true);
    readyCallbacks.add(callback);

    if (!isLoading) {
      isLoading = true;
      const previous = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        isLoaded = true;
        readyCallbacks.forEach((cb) => cb());
        readyCallbacks.clear();
        previous?.();
      };
      injectScript();
    }

    return () => {
      readyCallbacks.delete(callback);
    };
  }, []);

  return ready;
};
