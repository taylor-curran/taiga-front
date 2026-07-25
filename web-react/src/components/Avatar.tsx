import type { CSSProperties } from 'react';

interface AvatarProps {
  user?: { full_name?: string; full_name_display?: string; username?: string; photo?: string | null; color?: string } | null;
  size?: number;
  className?: string;
  style?: CSSProperties;
}

const PALETTE = [
  '#5dafcd', '#fa9082', '#71a966', '#ee8338', '#bc8cce',
  '#f1c350', '#a3d39c', '#e7726e', '#f6b27a', '#9bc0d6',
];

function colorFor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) & 0xffffffff;
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

export function Avatar({ user, size = 32, className = '', style }: AvatarProps) {
  const name = user?.full_name_display || user?.full_name || user?.username || '?';
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('') || '?';
  const bg = user?.color && /^#[0-9a-f]{3,8}$/i.test(user.color) ? user.color : colorFor(name);

  if (user?.photo) {
    return (
      <img
        src={user.photo}
        alt={name}
        title={name}
        width={size}
        height={size}
        style={{ width: size, height: size, ...(style || {}) }}
        className={`rounded-full object-cover bg-slate-200 ${className}`}
      />
    );
  }
  return (
    <span
      title={name}
      className={`inline-flex items-center justify-center rounded-full text-white font-semibold ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.4, backgroundColor: bg, ...(style || {}) }}
    >
      {initials}
    </span>
  );
}
