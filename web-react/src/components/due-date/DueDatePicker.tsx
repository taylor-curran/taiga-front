import { useState, useRef, useEffect } from 'react';
import { format, isPast, isToday, addDays, isBefore, parse } from 'date-fns';
import clsx from 'clsx';

interface DueDatePickerProps {
  value?: string | null;
  onChange: (date: string | null) => void;
  isClosed?: boolean;
  className?: string;
}

function parseLocalDate(dateStr: string): Date {
  return parse(dateStr, 'yyyy-MM-dd', new Date());
}

function getDateStatus(dateStr: string, isClosed: boolean) {
  if (isClosed) return 'closed';
  const date = parseLocalDate(dateStr);
  if (isPast(date) && !isToday(date)) return 'overdue';
  if (isToday(date)) return 'due-today';
  if (isBefore(date, addDays(new Date(), 7))) return 'due-soon';
  return 'normal';
}

const STATUS_STYLES: Record<string, string> = {
  overdue: 'text-taiga-red bg-taiga-red/10 border-taiga-red/30',
  'due-today': 'text-taiga-yellow bg-taiga-yellow/10 border-taiga-yellow/30',
  'due-soon': 'text-taiga-green-darker bg-taiga-green/10 border-taiga-green-dark/30',
  normal: 'text-taiga-text bg-taiga-bg border-taiga-grey-lighter',
  closed: 'text-taiga-grey-light bg-taiga-bg border-taiga-grey-lighter line-through',
};

export function DueDatePicker({
  value,
  onChange,
  isClosed = false,
  className,
}: DueDatePickerProps) {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const status = value ? getDateStatus(value, isClosed) : null;
  const displayDate = value ? format(parseLocalDate(value), 'MMM d, yyyy') : null;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={wrapperRef} className={clsx('relative inline-block', className)}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={clsx(
          'inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium border transition-colors',
          status ? STATUS_STYLES[status] : 'text-taiga-grey-light border-taiga-grey-lighter hover:border-taiga-green-dark',
        )}
      >
        <span>{'\uD83D\uDCC5'}</span>
        {displayDate ?? 'Set due date'}
      </button>

      {open && (
        <div className="absolute z-20 left-0 mt-1 bg-white border border-taiga-grey-lighter rounded shadow-lg p-3 space-y-2">
          <input
            ref={inputRef}
            type="date"
            value={value ?? ''}
            onChange={(e) => {
              onChange(e.target.value || null);
              setOpen(false);
            }}
            className="input text-xs"
            autoFocus
          />
          {value && (
            <button
              type="button"
              onClick={() => {
                onChange(null);
                setOpen(false);
              }}
              className="text-xs text-taiga-red hover:underline"
            >
              Remove due date
            </button>
          )}
        </div>
      )}
    </div>
  );
}
