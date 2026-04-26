/**
 * Match Angular's `momentFormat:'DD MMM YYYY HH:mm'` for en locale (Taiga default).
 */
export function formatTaigaDateTime(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  const m = d.getMonth();
  const day = d.getDate();
  const y = d.getFullYear();
  const h = d.getHours();
  const min = d.getMinutes();
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${String(day).padStart(2, '0')} ${monthNames[m]} ${y} ${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
}

/**
 * "time ago" style string for timeline header (simplified; reference uses momentFromNow).
 */
export function formatRelativeTime(iso: string | null | undefined): string {
  if (!iso) return '';
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return '';
  const diff = Date.now() - t;
  const s = Math.floor(diff / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 48) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}
