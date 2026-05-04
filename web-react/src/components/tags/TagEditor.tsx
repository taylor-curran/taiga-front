import { useState, useRef, useEffect, useCallback } from 'react';
import clsx from 'clsx';
import { type TagItem } from './TagDisplay';
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
  const [showNewColorPicker, setShowNewColorPicker] = useState(false);
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
      setShowNewColorPicker(false);
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
      {/* Tag list with color edit buttons */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {tags.map((tag) => (
            <span
              key={tag.name}
              className={clsx(
                'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium',
                tag.color ? 'text-white' : 'bg-taiga-grey-lighter text-taiga-text',
              )}
              style={tag.color ? { backgroundColor: tag.color } : undefined}
            >
              <button
                type="button"
                onClick={() => setShowColorPicker(showColorPicker === tag.name ? null : tag.name)}
                className="w-2.5 h-2.5 rounded-full border border-current shrink-0 hover:opacity-70"
                style={tag.color ? { backgroundColor: tag.color } : { backgroundColor: '#ccc' }}
                title="Change color"
              />
              {tag.name}
              <button
                type="button"
                onClick={() => handleRemove(tag.name)}
                className="hover:opacity-70"
              >
                {'\u00D7'}
              </button>
              {showColorPicker === tag.name && (
                <div
                  className="absolute z-10 mt-6"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ColorSelector
                    value={tag.color ?? undefined}
                    onChange={(c) => handleColorChange(tag.name, c)}
                    onClose={() => setShowColorPicker(null)}
                  />
                </div>
              )}
            </span>
          ))}
        </div>
      )}

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
          {/* Color picker for new tags */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNewColorPicker(!showNewColorPicker)}
              className="w-6 h-6 rounded-full border border-taiga-grey-lighter shrink-0 hover:opacity-70"
              style={{ backgroundColor: selectedColor ?? '#ccc' }}
              title="Pick color for new tag"
            />
            {showNewColorPicker && (
              <div className="absolute z-10 right-0 mt-1">
                <ColorSelector
                  value={selectedColor ?? undefined}
                  onChange={(c) => {
                    setSelectedColor(c);
                    setShowNewColorPicker(false);
                  }}
                  onClose={() => setShowNewColorPicker(false)}
                />
              </div>
            )}
          </div>
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
