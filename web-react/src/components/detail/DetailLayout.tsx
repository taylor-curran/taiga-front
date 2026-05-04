import { useState } from 'react';
import clsx from 'clsx';

interface SectionProps {
  title: string;
  collapsible?: boolean;
  defaultOpen?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function Section({
  title,
  collapsible = false,
  defaultOpen = true,
  children,
  className,
}: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className={clsx('space-y-2', className)}>
      <h3
        className={clsx(
          'text-sm font-semibold text-taiga-text flex items-center gap-1',
          collapsible && 'cursor-pointer select-none',
        )}
        onClick={() => collapsible && setOpen(!open)}
      >
        {collapsible && (
          <span
            className={clsx(
              'transition-transform text-xs text-taiga-grey',
              open ? 'rotate-90' : 'rotate-0',
            )}
          >
            {'\u25B6'}
          </span>
        )}
        {title}
      </h3>
      {(!collapsible || open) && children}
    </section>
  );
}

interface DetailLayoutProps {
  /** Top-level header (ref label, subject, status badges) */
  header: React.ReactNode;
  /** Main content area (description, tabs, activity) */
  main: React.ReactNode;
  /** Sidebar content (metadata, watchers, dates, tags) */
  sidebar: React.ReactNode;
  className?: string;
}

export function DetailLayout({ header, main, sidebar, className }: DetailLayoutProps) {
  return (
    <article className={clsx('space-y-4', className)}>
      {/* Header */}
      <div className="card p-6">{header}</div>

      {/* Body: main + sidebar */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 min-w-0 space-y-4">{main}</div>
        <aside className="w-full lg:w-72 shrink-0 space-y-4">{sidebar}</aside>
      </div>
    </article>
  );
}
