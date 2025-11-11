export function formatTime(totalSeconds: number | undefined | null): string {
  if (totalSeconds === undefined || totalSeconds === null || Number.isNaN(totalSeconds)) {
    return '0:00';
  }

  const seconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  const minutesStr = hours > 0 ? String(minutes).padStart(2, '0') : String(minutes);
  const secondsStr = String(remainingSeconds).padStart(2, '0');

  return hours > 0 ? `${hours}:${minutesStr}:${secondsStr}` : `${minutesStr}:${secondsStr}`;
}
