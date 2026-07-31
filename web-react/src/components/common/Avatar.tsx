import clsx from 'clsx';

interface AvatarProps {
  name?: string | null;
  src?: string | null;
  size?: number;
  className?: string;
}

export function Avatar({ name, src, size = 32, className }: AvatarProps) {
  const initials = (name || '?')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join('');
  if (src) {
    return (
      <img
        src={src}
        alt={name || ''}
        className={clsx('rounded-full object-cover', className)}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      className={clsx(
        'inline-flex items-center justify-center rounded-full bg-taiga-green-dark text-white font-semibold',
        className,
      )}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      aria-label={name || ''}
    >
      {initials || '?'}
    </span>
  );
}
