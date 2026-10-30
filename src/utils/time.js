export function formatTimestamp(ts) {
  if (typeof ts !== 'number') return String(ts ?? '');
  const date = new Date(ts);
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();

  if (sameDay) {
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `Today · ${displayHours}:${minutes} ${ampm}`;
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';

  const day = date.getDate();
  const month = date.toLocaleString('en-US', { month: 'short' });
  return `${day} ${month}`;
}

export function secondsAgo(ts) {
  if (typeof ts !== 'number') return null;
  return Math.max(0, Math.floor((Date.now() - ts) / 1000));
}

export function formatSecondsAgo(ts) {
  const secs = secondsAgo(ts);
  if (secs == null) return '—';
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  return `${hours}h ago`;
}

export function minutesNow() {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}
