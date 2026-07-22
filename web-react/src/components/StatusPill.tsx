import { statusContrastColor } from '@/lib/format';

interface StatusPillProps {
  name: string;
  color: string;
}

export function StatusPill({ name, color }: StatusPillProps) {
  return (
    <span
      className="status-pill"
      style={{
        background: color,
        color: statusContrastColor(color),
      }}
    >
      {name}
    </span>
  );
}
