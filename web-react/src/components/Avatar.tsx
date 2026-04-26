import { userPhotoUrl } from '@/lib/format';

interface AvatarProps {
  user?: { photo?: string | null; gravatar_id?: string | null; full_name_display?: string } | null;
  size?: number;
  alt?: string;
  className?: string;
}

export function Avatar({ user, size = 28, alt, className }: AvatarProps) {
  const url = userPhotoUrl(user, size * 2);
  const fallback = (alt ?? user?.full_name_display ?? '?').slice(0, 1).toUpperCase();
  return (
    <span
      className={['avatar', className].filter(Boolean).join(' ')}
      style={{ width: size, height: size, lineHeight: `${size}px`, fontSize: size * 0.45, textAlign: 'center', background: '#dde2e8', color: '#3a4452', overflow: 'hidden', display: 'inline-block' }}
      title={alt ?? user?.full_name_display ?? ''}
    >
      {url ? (
        <img
          src={url}
          alt={alt ?? user?.full_name_display ?? ''}
          width={size}
          height={size}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <span aria-hidden>{fallback}</span>
      )}
    </span>
  );
}
