import { ReactNode, useState, useRef, useEffect } from 'react';

interface TooltipProps {
  content: string;
  children: ReactNode;
  position?: 'top' | 'bottom';
}

export function Tooltip({ content, children, position = 'top' }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  function show() {
    clearTimeout(timeoutRef.current);
    setVisible(true);
  }

  function hide() {
    timeoutRef.current = setTimeout(() => setVisible(false), 100);
  }

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  return (
    <span className="relative inline-flex" onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={hide}>
      {children}
      {visible && (
        <span
          role="tooltip"
          className={`absolute z-dropdown whitespace-nowrap rounded-taiga bg-black-900 text-gray-100 px-2 py-1 text-xs pointer-events-none left-1/2 -translate-x-1/2 ${
            position === 'top' ? 'bottom-full mb-1' : 'top-full mt-1'
          }`}
        >
          {content}
        </span>
      )}
    </span>
  );
}
