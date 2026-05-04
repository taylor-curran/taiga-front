import clsx from 'clsx';

export interface TagItem {
  name: string;
  color?: string | null;
}

interface TagDisplayProps {
  tags: TagItem[];
  onRemove?: (name: string) => void;
  className?: string;
}

export function TagDisplay({ tags, onRemove, className }: TagDisplayProps) {
  if (!tags.length) return null;

  return (
    <div className={clsx('flex flex-wrap gap-1', className)}>
      {tags.map((tag) => (
        <span
          key={tag.name}
          className={clsx(
            'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium',
            tag.color ? 'text-white' : 'bg-taiga-grey-lighter text-taiga-text',
          )}
          style={tag.color ? { backgroundColor: tag.color } : undefined}
        >
          {tag.name}
          {onRemove && (
            <button
              type="button"
              onClick={() => onRemove(tag.name)}
              className="hover:opacity-70"
            >
              {'\u00D7'}
            </button>
          )}
        </span>
      ))}
    </div>
  );
}
