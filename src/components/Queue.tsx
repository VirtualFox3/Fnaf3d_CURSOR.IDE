import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { usePlayerStore } from '../store/playerStore';

const Queue = () => {
  const { queue, currentIndex, setCurrentIndex, clearQueue, shuffle, repeat } = usePlayerStore(
    useShallow((state) => ({
      queue: state.queue,
      currentIndex: state.currentIndex,
      setCurrentIndex: state.setCurrentIndex,
      clearQueue: state.clearQueue,
      shuffle: state.shuffle,
      repeat: state.repeat
    }))
  );

  const nextUp = useMemo(() => queue.slice(currentIndex + 1), [queue, currentIndex]);

  if (!queue.length) {
    return (
      <aside className="queue">
        <header className="queue__header">
          <h2 className="queue__title">Queue</h2>
        </header>
        <div className="queue__empty">Start playing a video to fill the queue.</div>
      </aside>
    );
  }

  return (
    <aside className="queue">
      <header className="queue__header">
        <div>
          <h2 className="queue__title">Queue</h2>
          <p className="queue__subtitle">
            {shuffle ? 'Shuffle enabled · ' : ''}
            Repeat: {repeat === 'off' ? 'Off' : repeat === 'one' ? 'One' : 'All'}
          </p>
        </div>
        <button type="button" className="queue__clear" onClick={clearQueue} aria-label="Clear queue">
          Clear
        </button>
      </header>
      <section className="queue__section">
        <h3 className="queue__section-title">Now Playing</h3>
        <ul className="queue__list">
          {queue[currentIndex] && (
            <li className="queue__item queue__item--active">
              <button type="button" className="queue__button" aria-current disabled>
                <span className="queue__title-primary">{queue[currentIndex].title}</span>
                <span className="queue__title-secondary">{queue[currentIndex].channel}</span>
              </button>
            </li>
          )}
        </ul>
      </section>
      {nextUp.length > 0 && (
        <section className="queue__section">
          <h3 className="queue__section-title">Up Next</h3>
          <ul className="queue__list">
            {nextUp.map((item, index) => {
              const absoluteIndex = currentIndex + 1 + index;
              return (
                <li key={item.id} className="queue__item">
                  <button
                    type="button"
                    className="queue__button"
                    onClick={() => setCurrentIndex(absoluteIndex)}
                  >
                    <span className="queue__title-primary">{item.title}</span>
                    <span className="queue__title-secondary">{item.channel}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}
      {currentIndex > 0 && (
        <section className="queue__section">
          <h3 className="queue__section-title">Previously</h3>
          <ul className="queue__list queue__list--muted">
            {queue.slice(0, currentIndex).map((item, index) => (
              <li key={`${item.id}-${index}`} className="queue__item queue__item--previous">
                <button type="button" className="queue__button" onClick={() => setCurrentIndex(index)}>
                  <span className="queue__title-primary">{item.title}</span>
                  <span className="queue__title-secondary">{item.channel}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </aside>
  );
};

export default Queue;
