export function gravatarUrl(id: string | null | undefined, size = 80): string {
  if (!id) return '';
  return `https://www.gravatar.com/avatar/${id}?s=${size}&d=identicon`;
}

export function userPhotoUrl(
  user: { photo?: string | null; gravatar_id?: string | null } | null | undefined,
  size = 80,
): string {
  if (!user) return '';
  if (user.photo) return user.photo;
  return gravatarUrl(user.gravatar_id, size);
}

export function formatDate(input: string | null | undefined): string {
  if (!input) return '';
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString();
}

export function pluralize(n: number, singular: string, plural?: string): string {
  return n === 1 ? singular : plural ?? singular + 's';
}

export function statusContrastColor(bg: string): string {
  const m = bg.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (!m) return '#fff';
  const r = parseInt(m[1], 16);
  const g = parseInt(m[2], 16);
  const b = parseInt(m[3], 16);
  return r * 0.299 + g * 0.587 + b * 0.114 > 160 ? '#1f2937' : '#fff';
}
