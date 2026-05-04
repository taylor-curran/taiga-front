import clsx from 'clsx';

interface VoteButtonProps {
  count: number;
  voted: boolean;
  onToggle: () => void;
  disabled?: boolean;
  className?: string;
}

export function VoteButton({
  count,
  voted,
  onToggle,
  disabled = false,
  className,
}: VoteButtonProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className={clsx(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-colors border',
        voted
          ? 'bg-taiga-green-dark text-white border-taiga-green-dark'
          : 'bg-transparent text-taiga-text border-taiga-grey-lighter hover:border-taiga-green-dark hover:text-taiga-green-dark',
        disabled && 'opacity-50 cursor-not-allowed',
        className,
      )}
    >
      <span className={clsx('text-base', voted ? 'text-white' : 'text-taiga-grey')}>
        {'\u25B2'}
      </span>
      <span>{count}</span>
    </button>
  );
}
