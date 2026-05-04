import { useState, useRef, useCallback } from 'react';
import clsx from 'clsx';
import DOMPurify from 'dompurify';
import { marked } from 'marked';

type ToolbarAction =
  | 'bold'
  | 'italic'
  | 'heading'
  | 'ul'
  | 'ol'
  | 'link'
  | 'image'
  | 'code'
  | 'mention';

interface RichTextEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  placeholder?: string;
  /** Project members for @mention autocomplete */
  members?: { id: number; username: string; full_name?: string }[];
  className?: string;
  minHeight?: number;
  readOnly?: boolean;
  submitLabel?: string;
}

const TOOLBAR: { action: ToolbarAction; icon: string; title: string }[] = [
  { action: 'bold', icon: 'B', title: 'Bold' },
  { action: 'italic', icon: 'I', title: 'Italic' },
  { action: 'heading', icon: 'H', title: 'Heading' },
  { action: 'ul', icon: '\u2022', title: 'Bullet list' },
  { action: 'ol', icon: '1.', title: 'Numbered list' },
  { action: 'link', icon: '\uD83D\uDD17', title: 'Link' },
  { action: 'image', icon: '\uD83D\uDDBC', title: 'Image' },
  { action: 'code', icon: '<>', title: 'Code' },
  { action: 'mention', icon: '@', title: 'Mention' },
];

function wrapSelection(
  textarea: HTMLTextAreaElement,
  before: string,
  after: string,
): string {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const text = textarea.value;
  const selected = text.slice(start, end) || 'text';
  return text.slice(0, start) + before + selected + after + text.slice(end);
}

function insertAtCursor(textarea: HTMLTextAreaElement, insert: string): string {
  const start = textarea.selectionStart;
  const text = textarea.value;
  return text.slice(0, start) + insert + text.slice(start);
}

export function RichTextEditor({
  value = '',
  onChange,
  onSubmit,
  placeholder = 'Write something...',
  members,
  className,
  minHeight = 120,
  readOnly = false,
  submitLabel = 'Save',
}: RichTextEditorProps) {
  const [mode, setMode] = useState<'write' | 'preview'>('write');
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionIdx, setMentionIdx] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const previewHtml = useCallback(() => {
    const raw = marked.parse(value, { async: false }) as string;
    return DOMPurify.sanitize(raw);
  }, [value]);

  const applyAction = useCallback(
    (action: ToolbarAction) => {
      const ta = textareaRef.current;
      if (!ta) return;
      let next = value;
      switch (action) {
        case 'bold':
          next = wrapSelection(ta, '**', '**');
          break;
        case 'italic':
          next = wrapSelection(ta, '_', '_');
          break;
        case 'heading':
          next = wrapSelection(ta, '## ', '');
          break;
        case 'ul':
          next = insertAtCursor(ta, '\n- ');
          break;
        case 'ol':
          next = insertAtCursor(ta, '\n1. ');
          break;
        case 'link':
          next = wrapSelection(ta, '[', '](url)');
          break;
        case 'image':
          next = insertAtCursor(ta, '![alt](url)');
          break;
        case 'code':
          next = wrapSelection(ta, '`', '`');
          break;
        case 'mention':
          next = insertAtCursor(ta, '@');
          setMentionQuery('');
          break;
      }
      onChange?.(next);
    },
    [value, onChange],
  );

  const filteredMembers = members?.filter((m) => {
    if (mentionQuery === null) return false;
    const q = mentionQuery.toLowerCase();
    return (
      m.username.toLowerCase().includes(q) ||
      (m.full_name?.toLowerCase().includes(q) ?? false)
    );
  });

  const handleTextChange = (text: string) => {
    onChange?.(text);
    // Detect @mention
    const ta = textareaRef.current;
    if (ta) {
      const cursor = ta.selectionStart;
      const before = text.slice(0, cursor);
      const atMatch = before.match(/@(\w*)$/);
      if (atMatch) {
        setMentionQuery(atMatch[1]);
        setMentionIdx(0);
      } else {
        setMentionQuery(null);
      }
    }
  };

  const insertMention = (username: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const cursor = ta.selectionStart;
    const text = ta.value;
    const before = text.slice(0, cursor);
    const after = text.slice(cursor);
    const atPos = before.lastIndexOf('@');
    const next = before.slice(0, atPos) + `@${username} ` + after;
    onChange?.(next);
    setMentionQuery(null);
  };

  const handleMentionKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (mentionQuery === null || !filteredMembers?.length) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setMentionIdx((i) => Math.min(i + 1, Math.min(filteredMembers.length, 10) - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setMentionIdx((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter' && mentionQuery !== null) {
        e.preventDefault();
        const visible = filteredMembers.slice(0, 10);
        if (visible[mentionIdx]) insertMention(visible[mentionIdx].username);
      } else if (e.key === 'Escape') {
        setMentionQuery(null);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mentionQuery, mentionIdx, filteredMembers],
  );

  return (
    <div className={clsx('border border-taiga-grey-lighter rounded', className)}>
      {/* Toolbar */}
      {!readOnly && (
        <div className="flex items-center gap-1 px-2 py-1 border-b border-taiga-grey-lighter bg-taiga-bg/50">
          {TOOLBAR.map((t) => (
            <button
              key={t.action}
              type="button"
              title={t.title}
              onClick={() => applyAction(t.action)}
              className="w-7 h-7 flex items-center justify-center rounded text-xs font-bold hover:bg-taiga-grey-lighter/60 text-taiga-text"
            >
              {t.icon}
            </button>
          ))}
          <span className="flex-1" />
          <button
            type="button"
            onClick={() => setMode(mode === 'write' ? 'preview' : 'write')}
            className="text-xs px-2 py-1 rounded hover:bg-taiga-grey-lighter/60 text-taiga-grey"
          >
            {mode === 'write' ? 'Preview' : 'Write'}
          </button>
        </div>
      )}

      {/* Content */}
      <div className="relative">
        {mode === 'write' && !readOnly ? (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => handleTextChange(e.target.value)}
            onKeyDown={handleMentionKeyDown}
            placeholder={placeholder}
            style={{ minHeight }}
            className="w-full px-3 py-2 text-sm resize-y focus:outline-none bg-transparent"
          />
        ) : (
          <div
            className="prose max-w-none text-sm px-3 py-2"
            style={{ minHeight }}
            dangerouslySetInnerHTML={{ __html: previewHtml() }}
          />
        )}

        {/* Mention dropdown */}
        {mentionQuery !== null && filteredMembers && filteredMembers.length > 0 && (
          <ul className="absolute z-10 left-3 mt-0 bg-white border border-taiga-grey-lighter rounded shadow-lg max-h-40 overflow-y-auto w-56">
            {filteredMembers.slice(0, 10).map((m, i) => (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => insertMention(m.username)}
                  className={clsx(
                    'w-full text-left px-3 py-1.5 text-sm hover:bg-taiga-bg',
                    i === mentionIdx && 'bg-taiga-bg',
                  )}
                >
                  <span className="font-medium">@{m.username}</span>
                  {m.full_name && (
                    <span className="ml-2 text-taiga-grey-light">{m.full_name}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Submit */}
      {onSubmit && !readOnly && (
        <div className="flex justify-end px-2 py-1 border-t border-taiga-grey-lighter">
          <button
            type="button"
            onClick={() => onSubmit(value)}
            className="btn-primary text-xs"
            disabled={!value.trim()}
          >
            {submitLabel}
          </button>
        </div>
      )}
    </div>
  );
}
