export const formatTime = (ms) => {
  if (!ms || isNaN(ms)) return '0:00';
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return m + ':' + s.toString().padStart(2, '0');
};

export const isCurrentShow = (time, endTime) => {
  const now = new Date();
  if (!time || typeof time !== 'string') return false;
  const [sh, sm] = time.split(':').map(Number);
  const [eh, em] = (endTime || '00:00').split(':').map(Number);
  if ([sh, sm, eh, em].some(n => Number.isNaN(n))) return false;
  const start = sh * 60 + sm;
  const rawEnd = eh * 60 + em;
  const end = rawEnd === 0 ? 24 * 60 : rawEnd;
  const current = now.getHours() * 60 + now.getMinutes();
  if (end > start) return current >= start && current < end;
  return current >= start || current < end;
};
