import { useState, useRef, useEffect, useCallback } from 'react';
import clsx from 'clsx';
import { TagDisplay, type TagItem } from './TagDisplay';
import { ColorSelector } from '@/components/color-selector/ColorSelector';

interface TagEditorProps {
  tags: TagItem[];
  projectTags?: TagItem[];
  onChange: (tags: TagItem[]) => void;
  className?: string;
}

export function TagEditor({
  tags,
  projectTags = [],
  onChange,
  className,
}: TagEditorProps) {
  const [input, setInput] = useState('');
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions = projectTags.filter(
    (pt) =>
      pt.name.toLowerCase().includes(input.toLowerCase()) &&
      !tags.some((t) => t.name === pt.name),
  );

  const handleAdd = useCallback(
    (name: string, color?: string | null) => {
      const trimmed = name.trim();
      if (!trimmed || tags.some((t) => t.name === trimmed)) return;
      onChange([...tags, { name: trimmed, color: color ?? null }]);
      setInput('');
      setShowSuggestions(false);
      setSelectedColor(null);
    },
    [tags, onChange],
  );

  const handleRemove = (name: string) => {
    onChange(tags.filter((t) => t.name !== name));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && input.trim()) {
      e.preventDefault();
      handleAdd(input, selectedColor);
    }
    if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleColorChange = (tagName: string, color: string) => {
    onChange(tags.map((t) => (t.name === tagName ? { ...t, color } : t)));
    setShowColorPicker(null);
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (inputRef.current && !inputRef.current.parentElement?.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className={clsx('space-y-2', className)}>
      <TagDisplay
        tags={tags}
        onRemove={handleRemove}
      />

      {/* Color picker for existing tags */}
      {tags.map((tag) => (
        <div key={tag.name} className="relative inline-block">
          {showColorPicker === tag.name && (
            <div className="absolute z-10 mt-1">
              <ColorSelector
                value={tag.color ?? undefined}
                onChange={(c) => handleColorChange(tag.name, c)}
                onClose={() => setShowColorPicker(null)}
              />
            </div>
          )}
        </div>
      ))}

      {/* Input */}
      <div className="relative">
        <div className="flex items-center gap-1">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            placeholder="Add tag..."
            className="input text-xs flex-1"
          />
          {input.trim() && (
            <button
              type="button"
              onClick={() => handleAdd(input, selectedColor)}
              className="text-xs text-taiga-green-dark hover:underline shrink-0"
            >
              Add
            </button>
          )}
        </div>

        {/* Autocomplete suggestions */}
        {showSuggestions && input && suggestions.length > 0 && (
          <ul className="absolute z-10 left-0 right-0 mt-1 bg-white border border-taiga-grey-lighter rounded shadow-lg max-h-40 overflow-y-auto">
            {suggestions.slice(0, 10).map((s) => (
              <li key={s.name}>
                <button
                  type="button"
                  onClick={() => handleAdd(s.name, s.color)}
                  className="w-full text-left px-3 py-1.5 text-sm flex items-center gap-2 hover:bg-taiga-bg"
                >
                  {s.color && (
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: s.color }}
                    />
                  )}
                  {s.name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
