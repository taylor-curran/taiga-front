import { useState } from 'react';
import clsx from 'clsx';

const PRESET_COLORS = [
  '#E44057', '#FFA726', '#FFD13E', '#A7CB23',
  '#25A28C', '#4FC3F7', '#4B86F4', '#9C27B0',
  '#7B64FF', '#607D8B', '#795548', '#333333',
  '#F48FB1', '#CE93D8', '#90CAF9', '#80CBC4',
];

interface ColorSelectorProps {
  value?: string;
  onChange: (color: string) => void;
  onClose?: () => void;
  presets?: string[];
  showCustom?: boolean;
  className?: string;
}

export function ColorSelector({
  value,
  onChange,
  onClose,
  presets = PRESET_COLORS,
  showCustom = true,
  className,
}: ColorSelectorProps) {
  const [customColor, setCustomColor] = useState(value ?? '#25A28C');

  return (
    <div
      className={clsx(
        'bg-white border border-taiga-grey-lighter rounded shadow-lg p-3 w-52',
        className,
      )}
    >
      <div className="grid grid-cols-4 gap-1.5">
        {presets.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => {
              onChange(color);
              onClose?.();
            }}
            className={clsx(
              'w-9 h-9 rounded-full border-2 transition-all hover:scale-110',
              value === color ? 'border-taiga-text scale-110' : 'border-transparent',
            )}
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>

      {showCustom && (
        <div className="mt-3 flex items-center gap-2 border-t border-taiga-grey-lighter pt-2">
          <input
            type="color"
            value={customColor}
            onChange={(e) => setCustomColor(e.target.value)}
            className="w-8 h-8 rounded cursor-pointer border-0 p-0"
          />
          <input
            type="text"
            value={customColor}
            onChange={(e) => setCustomColor(e.target.value)}
            className="input text-xs flex-1"
            placeholder="#RRGGBB"
          />
          <button
            type="button"
            onClick={() => {
              onChange(customColor);
              onClose?.();
            }}
            className="text-xs text-taiga-green-dark hover:underline"
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
}
