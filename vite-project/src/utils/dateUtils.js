export function combineDateTimeISO(date, time) {
  if (!date || !time) return null;
  // Create ISO string using local date+time
  try {
    const iso = new Date(date + 'T' + time).toISOString();
    return iso;
  } catch (e) {
    return null;
  }
}

export function isPastDateTime(date, time) {
  const iso = combineDateTimeISO(date, time);
  if (!iso) return false;
  return new Date(iso) < new Date();
}

export function isWithinBusinessHours(time) {
  if (!time) return true;
  const [h, m] = time.split(':').map(Number);
  if (Number.isNaN(h)) return true;
  // Business hours: 07:00 - 20:00 (inclusive start, exclusive end at 20:00)
  return h >= 7 && (h < 20 || (h === 20 && m === 0));
}

export function formatLocalDateTime(iso) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch (e) {
    return iso;
  }
}

export function todayDateString() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}