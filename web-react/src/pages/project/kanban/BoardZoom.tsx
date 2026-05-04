import clsx from 'clsx';
import { type ZoomLevel, useKanbanStore } from './useKanbanStore';

const ZOOM_LABELS: Record<ZoomLevel, string> = {
  0: 'Compact',
  1: 'Normal',
  2: 'Detailed',
  3: 'Expanded',
};

export function BoardZoom() {
  const zoom = useKanbanStore((s) => s.zoom);
  const setZoom = useKanbanStore((s) => s.setZoom);

  return (
    <div className="flex items-center gap-1">
      <span className="text-xs text-taiga-grey-light mr-1">Zoom</span>
      {([0, 1, 2, 3] as ZoomLevel[]).map((level) => (
        <button
          key={level}
          className={clsx(
            'w-6 h-6 rounded text-[10px] font-semibold transition-colors',
            zoom === level
              ? 'bg-taiga-green-dark text-white'
              : 'bg-taiga-grey-lighter/50 text-taiga-grey hover:bg-taiga-grey-lighter',
          )}
          onClick={() => setZoom(level)}
          title={ZOOM_LABELS[level]}
        >
          {level + 1}
        </button>
      ))}
    </div>
  );
}
